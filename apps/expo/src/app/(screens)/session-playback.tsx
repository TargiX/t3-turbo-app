import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, ScrollView, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Audio } from 'expo-av';
import { api } from "~/utils/api";
import Svg, { Circle } from 'react-native-svg';
import SpinnerLoader from '~/components/SpinnerLoader';

const BreathingGuide = ({ isPlaying }) => {
  const breathAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim1 = useRef(new Animated.Value(0)).current;
  const rippleAnim2 = useRef(new Animated.Value(0)).current;
  const rippleAnim3 = useRef(new Animated.Value(0)).current;

  const baseDuration = 1000; // 1 second as base unit
  const breathCycleDuration = 10 * baseDuration; // 8 seconds for full breath cycle

  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    if (isPlaying) {
      animation = Animated.loop(
        Animated.parallel([
          // Breathing animation
          Animated.sequence([
            Animated.timing(breathAnim, {
              toValue: 1,
              duration: breathCycleDuration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(breathAnim, {
              toValue: 0,
              duration: breathCycleDuration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ]),
          // Ripple animations
          Animated.sequence([
            Animated.delay(breathCycleDuration / 2.3),
            Animated.stagger(breathCycleDuration / 8.5, [
              createRippleAnimation(rippleAnim1),
              createRippleAnimation(rippleAnim2),
              createRippleAnimation(rippleAnim3),
            ]),
          ]),
        ])
      );

      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
      breathAnim.setValue(0);
      rippleAnim1.setValue(0);
      rippleAnim2.setValue(0);
      rippleAnim3.setValue(0);
    };
  }, [isPlaying]);

  const createRippleAnimation = (anim) => {
    return Animated.timing(anim, {
      toValue: 1,
      duration: breathCycleDuration / 2.5,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    });
  };

  const breathingScale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const breathingColor = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f8c9e0', '#f472b6'],
  });

  const createRippleStyle = (anim: Animated.Value) => {
    return {
      transform: [
        {
          scale: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 2],
          }),
        },
      ],
      opacity: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 0],
      }),
    };
  };

  return (
    <View style={styles.breathingGuideContainer}>
      <Animated.View style={[styles.ripple, createRippleStyle(rippleAnim3)]} />
      <Animated.View style={[styles.ripple, createRippleStyle(rippleAnim2)]} />
      <Animated.View style={[styles.ripple, createRippleStyle(rippleAnim1)]} />
      <Animated.View 
        style={[
          styles.breathingGuide,
          {
            transform: [{ scale: breathingScale }],
            backgroundColor: breathingColor,
          },
        ]}
      />
    </View>
  );
};

export default function SessionPlaybackScreen() {
  const { id } = useLocalSearchParams();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackObject, setPlaybackObject] = useState<Audio.PlaybackStatus | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const loadingAnimation = useRef(new Animated.Value(0)).current;
  
  const { data: session, isLoading } = api.session.getById.useQuery({ id: id as string });
  const updateProgress = api.session.updateUserProgress.useMutation();
  const rateSession = api.session.rateSession.useMutation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [showPostSession, setShowPostSession] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.audioFilePath) {
      loadAudio(session.audioFilePath);
    }
    return () => {
      cleanupAudio();
    };
  }, [session]);

  useEffect(() => {
    if (session?.audioFilePath && !isAudioReady) {
      startLoadingAnimation();
    }
  }, [session, isAudioReady]);

  const startLoadingAnimation = () => {
    loadingAnimation.setValue(0);
    Animated.timing(loadingAnimation, {
      toValue: 100,
      duration: 15000, // 15 seconds
      useNativeDriver: true,
    }).start();

    const listener = loadingAnimation.addListener(({ value }) => {
      setLoadingProgress(value);
    });

    return () => {
      loadingAnimation.removeListener(listener);
    };
  };

  async function loadAudio(audioFilePath: string) {
    try {
      console.log("Loading audio from:", audioFilePath);
      
      await cleanupAudio(); // Ensure any existing audio is cleaned up
      startLoadingAnimation(); // Start the loading animation

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioFilePath },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      console.log("Audio loaded successfully");
      setSound(newSound);
    } catch (error) {
      console.error("Error loading audio:", error);
      setIsAudioReady(false);
    }
  }

  const onPlaybackStatusUpdate = (status: Audio.PlaybackStatus) => {
    console.log("Audio status:", status);
    if (status.isLoaded) {
      setPlaybackObject(status);
      setIsAudioReady(true);
      // Complete the loading animation quickly
      Animated.timing(loadingAnimation, {
        toValue: 100,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  async function cleanupAudio() {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error("Error cleaning up audio:", error);
      }
      setSound(null);
      setPlaybackObject(null);
      setIsAudioReady(false);
      setIsPlaying(false);
    }
  }

  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error("Error setting up audio:", error);
      }
    }

    setupAudio();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            setShowPostSession(true);
            return 100;
          }
          return prev + 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isPlaying]);

  const handlePlayPause = async () => {
    if (sound && isAudioReady) {
      try {
        if (isPlaying) {
          console.log("Pausing audio");
          await sound.pauseAsync();
        } else {
          console.log("Playing audio");
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Error playing/pausing audio:", error);
        await cleanupAudio(); // Attempt to clean up if an error occurs
        if (session?.audioFilePath) {
          loadAudio(session.audioFilePath); // Reload the audio
        }
      }
    } else {
      console.log("Sound is not ready yet");
    }
  };

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleSubmit = () => {
    if (rating > 0) {
      rateSession.mutate({
        sessionId: id as string,
        rating,
        notes,
      });
    } else {
      updateProgress.mutate({
        sessionId: id as string,
        progress: 100,
      });
    }
    router.back();
  };

  const handleEndSession = () => {
    if (isPlaying) {
      handlePlayPause();
    }
    setShowPostSession(true);
  };

  const CircularProgress = ({ progress }) => {
    const size = 100;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progressOffset = circumference - (progress / 100) * circumference;

    return (
      <Svg width={size} height={size}>
        <Circle
          stroke="#f0f0f0"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="#f472b6"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
        />
      </Svg>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <SpinnerLoader size={100} color="#f472b6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>{session?.title}</Text>
          <Text style={styles.category}>{session?.category}</Text>

          {!showPostSession ? (
            <>
              <BreathingGuide isPlaying={isPlaying} />
              
              <View style={styles.playButtonContainer}>
                <CircularProgress progress={loadingProgress} />
                {!isAudioReady && (
                  <View style={styles.loaderOverlay}>
                    <SpinnerLoader size={80} color="#f472b6" />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.playPauseButton} 
                  onPress={handlePlayPause}
                  disabled={!isAudioReady}
                >
                  <Ionicons 
                    name={isPlaying ? 'pause' : 'play'} 
                    size={50} 
                    color={isAudioReady ? "#fff" : "#ccc"} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{`${Math.round(progress)}%`}</Text>

              <TouchableOpacity style={styles.endSessionButton} onPress={handleEndSession}>
                <Text style={styles.endSessionButtonText}>End Session</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.postSessionContainer}>
              <Text style={styles.postSessionTitle}>How was your session?</Text>
              <Text style={styles.ratingSubtitle}>(Optional)</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color="#f472b6"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes about your session (optional)..."
                value={notes}
                onChangeText={setNotes}
                multiline
              />
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Finish Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  category: {
    fontSize: 18,
    color: '#888',
    marginBottom: 30,
  },
  breathingGuideContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  breathingGuide: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(244, 114, 182, 0.3)',
  },
  playButtonContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  playPauseButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f472b6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f472b6',
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  endSessionButton: {
    backgroundColor: '#f472b6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 0,
  },
  endSessionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postSessionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  postSessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  notesInput: {
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#f472b6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});