import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from './_layout';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      try {
        const enrollmentData = await AsyncStorage.getItem('deviceEnrollment');
        if (enrollmentData) {
          setIsEnrolled(true);
        }
      } catch (error) {
        console.error('Error reading enrollment data', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnrollmentStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="forestgreen" />
      </View>
    );
  }

  return <Layout isEnrolled={isEnrolled} />;
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;