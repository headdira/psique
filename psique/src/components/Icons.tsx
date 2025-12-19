import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface IconProps {
  size?: number;
  color?: string;
}

export const CoffeeIcon = ({ size = 24, color = Colors.black }: IconProps) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <View style={[styles.coffeeCup, { borderColor: color }]} />
    <View style={[styles.coffeeHandle, { borderColor: color }]} />
  </View>
);

export const MusicIcon = ({ size = 24, color = Colors.black }: IconProps) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <View style={[styles.musicNote, { backgroundColor: color }]} />
    <View style={[styles.musicStem, { backgroundColor: color }]} />
  </View>
);

export const MapIcon = ({ size = 24, color = Colors.black }: IconProps) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <View style={[styles.map, { borderColor: color }]} />
    <View style={[styles.mapPin, { backgroundColor: color }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  coffeeCup: {
    width: '60%',
    height: '70%',
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'absolute',
    bottom: 0,
    left: '20%',
  },
  coffeeHandle: {
    width: '30%',
    height: '40%',
    borderWidth: 2,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    position: 'absolute',
    right: 0,
    top: '30%',
  },
  musicNote: {
    width: '40%',
    height: '20%',
    borderRadius: 1,
    position: 'absolute',
    top: '20%',
    left: '30%',
  },
  musicStem: {
    width: '10%',
    height: '60%',
    position: 'absolute',
    bottom: '20%',
    left: '70%',
  },
  map: {
    width: '80%',
    height: '80%',
    borderWidth: 1,
    borderRadius: 2,
    position: 'absolute',
    top: '10%',
    left: '10%',
  },
  mapPin: {
    width: '20%',
    height: '20%',
    borderRadius: 10,
    position: 'absolute',
    bottom: '10%',
    right: '10%',
  },
});