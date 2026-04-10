import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { REPORT_ARCHIVE_HOURS } from '@townly/shared';

interface Props {
  createdAt: string;
}

function getRemainingHours(createdAt: string): number {
  const expiresAt = new Date(createdAt).getTime() + REPORT_ARCHIVE_HOURS * 60 * 60 * 1000;
  const remaining = (expiresAt - Date.now()) / (60 * 60 * 1000);
  return Math.max(0, remaining);
}

export function ArchiveCountdown({ createdAt }: Props) {
  const [hours, setHours] = useState(() => getRemainingHours(createdAt));

  useEffect(() => {
    const timer = setInterval(() => setHours(getRemainingHours(createdAt)), 60_000);
    return () => clearInterval(timer);
  }, [createdAt]);

  if (hours <= 0) return <Text style={styles.expired}>Expired</Text>;

  const label = hours < 1
    ? `${Math.round(hours * 60)}m left`
    : `${Math.floor(hours)}h left`;

  return (
    <Text style={[styles.text, hours < 6 && styles.urgent]}>{label}</Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  urgent: { color: '#f97316' },
  expired: { fontSize: 11, color: '#ef4444', fontWeight: '500' },
});
