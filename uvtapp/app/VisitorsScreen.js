import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';

const VisitorsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { employeeCodeIdFromPreviousScreen = 'Unknown Employee' } = route.params || {};
  const [visitHistory, setVisitHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View>
          <Text style={styles.headerRight}>{employeeCodeIdFromPreviousScreen}</Text>
        </View>
      ),
    });

    // Listen for connectivity changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        fetchVisitHistory(); // Retry fetching when connected
      }
    });

    return () => unsubscribe();
  }, [employeeCodeIdFromPreviousScreen]);

  const fetchVisitHistory = async () => {
    const state = await NetInfo.fetch();

    if (!state.isConnected) {
      Alert.alert('No Internet', 'Please check your internet connection and try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://223e-41-77-146-22.ngrok-free.app/api/VisitDetails/employeeCode/${employeeCodeIdFromPreviousScreen}`
      );

      console.log('API Response:', response.data);

      if (Array.isArray(response.data)) {
        setVisitHistory(
          response.data.sort(
            (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
          )
        );
      } else {
        Alert.alert('Error', 'Unexpected response format.');
      }
    } catch (error) {
      console.error('Error fetching visit history:', error);
      Alert.alert('Error', 'Failed to fetch visit history.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineScenario = () => {
    Alert.alert(
      'You Are Offline',
      'The app requires an internet connection to fetch visit history. Please reconnect and try again.'
    );
  };

  const renderVisitItem = ({ item }) => (
    <View style={styles.visitItem}>
      <Text style={styles.itemHeader}>Visit Date</Text>
      <Text style={styles.itemText}>{new Date(item.transactionDate).toLocaleDateString()}</Text>

      <Text style={styles.itemHeader}>Category</Text>
      <Text style={styles.itemText}>{item.category}</Text>

      <Text style={styles.itemHeader}>Priority</Text>
      <Text style={styles.itemText}>{item.priority}</Text>

      <Text style={styles.itemHeader}>Shaft</Text>
      <Text style={styles.itemText}>{item.shaft}</Text>

      <Text style={styles.itemHeader}>Location</Text>
      <Text style={styles.itemText}>{item.location}</Text>

      <Text style={styles.itemHeader}>Full Comment</Text>
      <Text style={styles.itemText}>{item.fullComment}</Text>

      <Text style={styles.itemHeader}>Employee Code</Text>
      <Text style={styles.itemText}>{item.employeeCode}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="forestgreen" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Underground Visitor Management</Text>
      </View>
      <Text style={styles.screenTitle}>Visit History</Text>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>You are offline. Reconnect to fetch visit history.</Text>
        </View>
      )}
      <FlatList
        data={visitHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderVisitItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No visit history available.</Text>}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.fetchButton} onPress={fetchVisitHistory}>
          <Text style={styles.fetchButtonText}>Fetch History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() =>
            navigation.navigate('VisitorAccessScreen', { employeeCodeIdFromPreviousScreen })
          }
        >
          <Text style={styles.buttonText}>Request Another Visit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerBar: { alignItems: 'center', backgroundColor: 'forestgreen', padding: 16, borderRadius: 10, marginBottom: 16 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  screenTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: 'forestgreen' },
  offlineBanner: { backgroundColor: '#f8d7da', padding: 10, marginBottom: 10, borderRadius: 5 },
  offlineText: { color: '#721c24', fontSize: 14, textAlign: 'center' },
  visitItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.5,
  },
  itemHeader: { fontSize: 14, fontWeight: '600', color: 'black', marginTop: 8 },
  itemText: { fontSize: 16, marginBottom: 8, color: '#333' },
  emptyText: { textAlign: 'center', color: '#666', fontSize: 16, marginTop: 24 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRight: { color: 'white', fontSize: 16, marginRight: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  fetchButton: { backgroundColor: 'forestgreen', padding: 15, borderRadius: 8, alignItems: 'center', flex: 1, marginRight: 8 },
  fetchButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  requestButton: { backgroundColor: 'orange', padding: 15, borderRadius: 8, alignItems: 'center', flex: 1, marginLeft: 8 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default VisitorsScreen;
