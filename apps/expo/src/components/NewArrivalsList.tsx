import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import SpinnerLoader from './SpinnerLoader';

interface NewArrivalsListProps {
  isLoading: boolean;
  data: any[]; // Replace 'any' with your specific data type
  renderItem: ({ item }: { item: any }) => React.ReactElement;
}

const NewArrivalsList: React.FC<NewArrivalsListProps> = ({ isLoading, data, renderItem }) => {
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <SpinnerLoader size={40} color="#f472b6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Arrivals</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
  },
  loaderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewArrivalsList;