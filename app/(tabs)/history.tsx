import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { listGames } from '@/lib/db';
import type { GameWithPlayers } from '@/lib/db';

const C = {
  bg: '#0A0A0A',
  surface: '#111827',
  border: '#1F2937',
  primary: '#10B981',
  text: '#F9FAFB',
  textMuted: '#6B7280',
  danger: '#EF4444',
};

const VARIANT_LABELS: Record<string, string> = {
  simple: 'Simple',
  '71': '71',
  '71_bla_joker': '71 Bla Joker',
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function HistoryScreen() {
  const { t } = useTranslation();
  const [games, setGames] = useState<GameWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const all = await listGames();
          if (!cancelled) setGames(all.filter((g) => g.status !== 'active'));
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.history')}</Text>
      </View>
      <FlatList
        data={games}
        keyExtractor={(g) => g.id}
        contentContainerStyle={games.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>{t('common.noGames')}</Text>
            <Text style={styles.emptyDesc}>{t('common.noGamesDesc')}</Text>
          </View>
        )}
        renderItem={({ item: game }) => {
          const winner = game.players.find((p) => p.player_id === game.winner_id);
          const statusColor =
            game.status === 'completed' ? C.primary : C.textMuted;
          return (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/game/${game.id}`)}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.variantLabel}>
                    {VARIANT_LABELS[game.variant]}
                  </Text>
                  <Text style={styles.date}>{formatDate(game.created_at)}</Text>
                </View>
                <Text style={[styles.statusBadge, { color: statusColor }]}>
                  {t(`game.${game.status}`)}
                </Text>
              </View>
              <View style={styles.players}>
                {game.players.map((p) => (
                  <Text
                    key={p.player_id}
                    style={[
                      styles.playerChip,
                      p.player_id === game.winner_id && styles.winnerChip,
                    ]}
                  >
                    {p.player_id === game.winner_id ? '🏆 ' : ''}{p.name}
                  </Text>
                ))}
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
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
  list: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    padding: 40,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: C.text, fontSize: 18, fontWeight: '700' },
  emptyDesc: { color: C.textMuted, fontSize: 14, textAlign: 'center' },
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  variantLabel: {
    color: C.text,
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  players: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  playerChip: {
    backgroundColor: '#1F2937',
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  winnerChip: {
    backgroundColor: '#065F46',
    color: C.primary,
  },
});
