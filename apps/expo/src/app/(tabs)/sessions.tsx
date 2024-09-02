import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from "~/utils/api";
import SpinnerLoader from '~/components/SpinnerLoader';

// Keep the categories as is for now
const categories = ['Sleep', 'Stress', 'Focus', 'Anxiety', 'Meditation'];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch user sessions with progress
  const { data: userSessions, isLoading } = api.session.getUserSessionsWithProgress.useQuery();

  const handleSessionPress = (session: { id: string; title: string; category: string }) => {
    router.push({
      pathname: '/(screens)/session-playback',
      params: { id: session.id, title: session.title, category: session.category }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* <View style={styles.searchContainer}>
          <Ionicons name="search" size={24} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sessions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View> */}

        {/* <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView> */}

        {/* <Text style={styles.sectionTitle}>Sessions list</Text> */}
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <SpinnerLoader size={40} color="#f472b6" />
          </View>
        ) : (
          userSessions?.map((session, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.sessionItem}
              onPress={() => handleSessionPress(session)}
            >
              <Text style={styles.sessionCategory}>Session {index + 1}</Text>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionProgress}>Progress: {session.progress}%</Text>
            </TouchableOpacity>
          ))
        )}

        {/* You can keep the Featured Sessions section if you want, or remove it */}
      </ScrollView>
    </SafeAreaView>
  );
}

// Keep the existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    margin: 10,
    paddingHorizontal: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  categoryButton: {
    backgroundColor: '#f472b6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sessionItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionCategory: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  sessionProgress: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
});