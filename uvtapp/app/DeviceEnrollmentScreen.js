import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-GB') : '');

const DeviceEnrollmentScreen = () => {
  const navigation = useNavigation();

  const [employeeCode, setEmployeeCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [designation, setDesignation] = useState('');
  const [dateEnrolled, setDateEnrolled] = useState(new Date());
  const [lastSync, setLastSync] = useState(new Date());
  const [showDateEnrolledPicker, setShowDateEnrolledPicker] = useState(false);
  const [showLastSyncPicker, setShowLastSyncPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const checkExistingEnrollment = async () => {
      try {
        const enrollment = await AsyncStorage.getItem('deviceEnrollment');
        if (enrollment) {
          navigation.replace('VisitorsScreen');
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
      }
    };

    checkExistingEnrollment();

    const checkNetworkStatus = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      checkNetworkStatus();
    };
  }, [navigation]);

  const validateFields = () => {
    const newErrors = {};
    if (!employeeCode.trim()) newErrors.employeeCode = 'Employee Code is required.';
    if (!firstName.trim()) newErrors.firstName = 'First Name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last Name is required.';
    if (!designation.trim()) newErrors.designation = 'Designation is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEnrollDevice = async () => {
    Keyboard.dismiss();
    if (!validateFields()) return;

    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
      return;
    }

    const enrollment = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      employeeCode: employeeCode.trim(),
      designation: designation.trim(),
      dateEnrolled: dateEnrolled.toISOString(),
      status: state.isConnected,
      lastSync: lastSync.toISOString(),
    };

    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://223e-41-77-146-22.ngrok-free.app/api/DeviceUserEnrollment',
        enrollment,
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem('deviceEnrollment', JSON.stringify(enrollment));
      } else {
        throw new Error(`Server responded with status ${response.status}`);
      }1
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setIsLoading(false);
      console.log('Navigating to VisitorsScreen with employeeCode:', employeeCode.trim());
      navigation.replace('VisitorsScreen', { 
        employeeCodeIdFromPreviousScreen: employeeCode.trim() 
      });
    }
  };

  const onDateChange = (event, selectedDate, type) => {
    const currentDate = selectedDate || new Date();
    if (type === 'dateEnrolled') {
      setShowDateEnrolledPicker(false);
      setDateEnrolled(currentDate);
    } else {
      setShowLastSyncPicker(false);
      setLastSync(currentDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerBar}>
            <Image 
              source={require('../assets/images/newlogo.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Underground Visitor Enrollment</Text>
          </View>

          <View style={styles.cardContainer}>
            <Text style={styles.sectionTitle}>Enter Details</Text>
            
            <Text style={styles.inputLabel}>Employee Code</Text>
            <TextInput
              style={[styles.input, errors.employeeCode && styles.errorInput]}
              value={employeeCode}
              onChangeText={setEmployeeCode}
              placeholder="Enter Employee Code"
              placeholderTextColor="#888"
            />
            {errors.employeeCode && <Text style={styles.errorText}>{errors.employeeCode}</Text>}

            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.errorInput]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter First Name"
              placeholderTextColor="#888"
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.errorInput]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter Last Name"
              placeholderTextColor="#888"
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

            <Text style={styles.inputLabel}>Designation</Text>
            <TextInput
              style={[styles.input, errors.designation && styles.errorInput]}
              value={designation}
              onChangeText={setDesignation}
              placeholder="Enter Designation"
              placeholderTextColor="#888"
            />
            {errors.designation && <Text style={styles.errorText}>{errors.designation}</Text>}

            <Text style={styles.inputLabel}>Date Enrolled</Text>
            <TouchableOpacity onPress={() => setShowDateEnrolledPicker(true)}>
              <TextInput
                style={styles.input}
                value={formatDate(dateEnrolled)}
                placeholder="Select Date Enrolled"
                placeholderTextColor="#888"
                editable={false}
              />
            </TouchableOpacity>
            {showDateEnrolledPicker && (
              <DateTimePicker 
                value={dateEnrolled} 
                mode="date" 
                display="default" 
                onChange={(event, date) => onDateChange(event, date, 'dateEnrolled')} 
              />
            )}

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Visitors Status:</Text>
              <View style={[styles.statusButton, { backgroundColor: isConnected ? '#4CAF50' : '#FF9800' }]}>
                <Text style={styles.statusText}>{isConnected ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.enrollButton} onPress={handleEnrollDevice} disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.buttonText}>Enroll Device</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f5' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  headerBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'forestgreen', padding: 16, borderRadius: 10, marginBottom: 16, elevation: 3 },
  logo: { width: 40, height: 50, marginRight: 12 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', flex: 1, flexWrap: 'wrap' },
  cardContainer: { backgroundColor: '#f0fff0', borderRadius: 8, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: 'forestgreen', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: 'lightgreen', borderRadius: 5, padding: 12, marginBottom: 16, fontSize: 16, backgroundColor: 'white' },
  errorInput: { borderColor: 'red', backgroundColor: '#fff0f0' },
  errorText: { color: 'red', fontSize: 12, marginBottom: 12, marginLeft: 4 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statusLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginRight: 8 },
  statusButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 5 },
  statusText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  enrollButton: { backgroundColor: 'forestgreen', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 16, elevation: 2 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default DeviceEnrollmentScreen;
