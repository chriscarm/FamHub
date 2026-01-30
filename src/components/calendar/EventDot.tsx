import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { Person } from '../../types';

interface EventDotProps {
  person: Person;
  size?: number;
}

export function EventDot({ person, size = 8 }: EventDotProps) {
  const dotColor = person === 'chris' ? colors.chris : colors.christy;

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dotColor,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    marginHorizontal: 2,
  },
});
