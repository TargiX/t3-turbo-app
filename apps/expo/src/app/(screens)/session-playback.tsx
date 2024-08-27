import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Audio } from 'expo-av';
import { api } from "~/utils/api";

export default function SessionPlaybackScreen() {
  const { id } = useLocalSearchParams();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  const { data: session, isLoading } = api.session.getById.useQuery({ id: id as string });
  const updateProgress = api.session.updateUserProgress.useMutation();
  const rateSession = api.session.rateSession.useMutation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [showPostSession, setShowPostSession] = useState(false);

  // Animation for breathing guide
  const breathAnim = new Animated.Value(1);

  useEffect(() => {
    if (session?.audioFilePath) {
      console.log("Session data:", session);
      console.log("Audio file path:", session.audioFilePath);
      loadAudio(session.audioFilePath);
    } else {
      console.log("No audio file path found in session data");
    }
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [session]);

  async function loadAudio(audioFilePath: string) {
    try {
      console.log("Loading audio from:", audioFilePath);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioFilePath },
        { shouldPlay: false }
      );
      console.log("Audio loaded successfully");
      setSound(newSound);
    } catch (error) {
      console.error("Error loading audio:", error);
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
      }, 1000); // Update every second

      // Breathing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, {
            toValue: 1.2,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(breathAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handlePlayPause = async () => {
    if (sound) {
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
      }
    } else {
      console.log("Sound object is null");
    }
  };

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleSubmit = () => {
    rateSession.mutate({
      sessionId: id as string,
      rating,
      notes,
    });
    router.back();
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      
      <Text style={styles.title}>{session?.title}</Text>
      <Text style={styles.category}>{session?.category}</Text>

      {!showPostSession ? (
        <>
          <Animated.View style={[styles.breathingGuide, { transform: [{ scale: breathAnim }] }]} />
          
          <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={50} color="#fff" />
          </TouchableOpacity>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{`${Math.round(progress)}%`}</Text>
        </>
      ) : (
        <View style={styles.postSessionContainer}>
          <Text style={styles.postSessionTitle}>How was your session?</Text>
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
            placeholder="Add notes about your session..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
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
  breathingGuide: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(244, 114, 182, 0.3)',
    marginBottom: 30,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f472b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBarContainer: {
    width: '80%',
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f472b6',
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
  },
  postSessionContainer: {
    width: '80%',
    alignItems: 'center',
  },
  postSessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});