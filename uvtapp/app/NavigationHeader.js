import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const NavigationHeader = () => {
  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/images/newlogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'forestgreen', 
    padding: 10,
    flexDirection: 'row',
  },
  logo: {
    width: 100, 
    height: 60, 
  },
});

export default NavigationHeader;
