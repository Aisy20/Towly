import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';
import { Report, CATEGORY_META } from '@townly/shared';

interface Props {
  report: Report;
  onPress: (report: Report) => void;
}

export function ReportPin({ report, onPress }: Props) {
  const meta = CATEGORY_META[report.category];

  return (
    <Marker
      coordinate={{ latitude: report.latitude, longitude: report.longitude }}
      onPress={() => onPress(report)}
      tracksViewChanges={false}
    >
      <View style={[styles.pin, { backgroundColor: meta.color }]}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
      </View>
      <View style={[styles.pinTail, { borderTopColor: meta.color }]} />
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emoji: { fontSize: 18 },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -1,
  },
});
