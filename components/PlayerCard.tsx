import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const C = {
  surface: '#111827',
  border: '#1F2937',
  primary: '#10B981',
  text: '#F9FAFB',
  textMuted: '#6B7280',
  danger: '#EF4444',
};

const AVATAR_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EC4899', '#06B6D4', '#EF4444', '#84CC16',
];

interface Props {
  name: string;
  score: number;
  rank: number;
  isLeading: boolean;
  isEliminated: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function PlayerCard({ name, score, rank, isLeading, isEliminated }: Props) {
  const avatarColor = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];

  return (
    <View style={[styles.card, isLeading && styles.cardLeading]}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.initials}>{getInitials(name)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {isEliminated ? '💀 ' : ''}{name}
      </Text>
      <Text style={[styles.score, isEliminated && styles.scoreElim]}>
        {score}
      </Text>
      {isLeading && <Text style={styles.leadBadge}>★</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    minWidth: 80,
    gap: 6,
  },
  cardLeading: {
    borderColor: C.primary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  name: {
    color: C.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  score: {
    color: C.text,
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scoreElim: {
    color: C.danger,
  },
  leadBadge: {
    color: C.primary,
    fontSize: 14,
  },
});
