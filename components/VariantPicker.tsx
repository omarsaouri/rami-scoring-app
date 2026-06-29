import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { GameVariant } from '@/lib/db';
import { VARIANTS } from '@/lib/rules';

const C = {
  bg: '#0A0A0A',
  surface: '#111827',
  border: '#1F2937',
  primary: '#10B981',
  text: '#F9FAFB',
  textMuted: '#6B7280',
};

interface Props {
  selected: GameVariant;
  onSelect: (v: GameVariant) => void;
}

export default function VariantPicker({ selected, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {VARIANTS.map((v) => {
        const isSelected = v.id === selected;
        return (
          <Pressable
            key={v.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onSelect(v.id)}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {v.label}
            </Text>
            <Text style={styles.desc}>{t(v.descKey)}</Text>
            <Text style={styles.cards}>{v.cards} cartes</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: C.border,
  },
  cardSelected: {
    borderColor: C.primary,
  },
  label: {
    color: C.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  labelSelected: {
    color: C.primary,
  },
  desc: {
    color: C.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  cards: {
    color: C.textMuted,
    fontSize: 12,
  },
});
