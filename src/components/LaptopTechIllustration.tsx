import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export const LaptopTechIllustration: React.FC<{ size?: number }> = ({ size = 110 }) => {
  return (
    <View style={[styles.container, { width: size * 1.25, height: size }]}>
      <Image
        source={require('../assets/dashboard/fullstack_laptop.png')}
        style={{ width: size * 1.25, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
