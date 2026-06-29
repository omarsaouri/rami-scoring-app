import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/gameStore';
import { buildCumulativeScores } from '@/lib/scoring';

const C = {
  bg: '#0A0A0A',
  surface: '#111827',
  border: '#1F2937',
  primary: '#10B981',
  primaryDim: '#065F46',
  text: '#F9FAFB',
  textMuted: '#6B7280',
};

const VARIANT_LABELS: Record<string, string> = {
  simple: 'Simple',
  '71': '71',
  '71_bla_joker': '71 Bla Joker',
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { activeGame, rounds } = useGameStore();

  const cumScores = activeGame ? buildCumulativeScores(rounds) : {};
  const playersSorted = activeGame
    ? [...activeGame.players].sort(
        (a, b) => (cumScores[a.player_id] ?? 0) - (cumScores[b.player_id] ?? 0)
      )
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.appName}>Rami Score</Text>
          <Text style={styles.tagline}>الحساب ديال الرامي</Text>
        </View>

        {activeGame ? (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <Text style={styles.activeLabel}>{t('home.activeGame')}</Text>
              <Text style={styles.variantBadge}>
                {VARIANT_LABELS[activeGame.variant]}
              </Text>
            </View>
            <Text style={styles.roundCount}>
              {t('home.round')} {rounds.length}
            </Text>

            <View style={styles.playersList}>
              {playersSorted.slice(0, 4).map((p, i) => (
                <View key={p.player_id} style={styles.playerRow}>
                  <Text style={[styles.playerRank, i === 0 && styles.leadRank]}>
                    {i === 0 ? '★' : `${i + 1}`}
                  </Text>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={[styles.playerScore, i === 0 && styles.leadScore]}>
                    {cumScores[p.player_id] ?? 0}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.push(`/game/${activeGame.id}`)}
            >
              <Text style={styles.primaryBtnText}>{t('home.resumeGame')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🃏</Text>
            <Text style={styles.emptyTitle}>{t('home.noActiveGame')}</Text>
            <Text style={styles.emptyDesc}>{t('home.startFirst')}</Text>
          </View>
        )}

        <Pressable
          style={[styles.primaryBtn, activeGame && styles.secondaryBtn]}
          onPress={() => router.push('/game/new')}
        >
          <Text style={[styles.primaryBtnText, activeGame && styles.secondaryBtnText]}>
            {t('home.newGame')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  titleRow: {
    paddingTop: 10,
    gap: 4,
  },
  appName: {
    color: C.primary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    color: C.textMuted,
    fontSize: 14,
    fontFamily: 'System',
  },
  activeCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.primary,
    gap: 12,
    flex: 1,
    maxHeight: 320,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeLabel: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  variantBadge: {
    color: C.primary,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: C.primaryDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roundCount: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
  },
  playersList: {
    gap: 8,
    flex: 1,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerRank: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  leadRank: {
    color: C.primary,
  },
  playerName: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  playerScore: {
    color: C.text,
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  leadScore: {
    color: C.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDesc: {
    color: C.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryBtnText: {
    color: C.text,
  },
});
