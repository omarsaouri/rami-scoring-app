import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';

const C = {
  bg: '#0A0A0A',
  text: '#F9FAFB',
  textMuted: '#6B7280',
  primary: '#10B981',
};

export default function StatsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.stats')}</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.icon}>📊</Text>
        <Text style={styles.soon}>Stats coming soon</Text>
        <Text style={styles.desc}>Phase 2 feature</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: '900',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  icon: { fontSize: 48 },
  soon: { color: C.text, fontSize: 20, fontWeight: '700' },
  desc: { color: C.textMuted, fontSize: 14 },
});
