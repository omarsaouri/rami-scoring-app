import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Scoreboard from '@/components/Scoreboard';
import { getGame, getRounds, abandonGame } from '@/lib/db';
import { buildCumulativeScores, getWinner } from '@/lib/scoring';
import { useGameStore } from '@/store/gameStore';
import type { GameWithPlayers, RoundWithScores } from '@/lib/db';
import { Colors as C } from '@/constants/theme';
import { VARIANT_LABELS } from '@/lib/rules';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { setActiveGame, setRounds, clearGame } = useGameStore();

  const [game, setGame] = useState<GameWithPlayers | null>(null);
  const [rounds, setLocalRounds] = useState<RoundWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!id) return;
        setLoading(true);
        try {
          const g = await getGame(id);
          const r = await getRounds(id);
          if (!cancelled) {
            setGame(g);
            setLocalRounds(r);
            if (g?.status === 'active') {
              setActiveGame(g);
              setRounds(r);
            }
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [id])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.center}>
        <Text style={{ color: C.textMuted }}>Game not found</Text>
      </View>
    );
  }

  const cumScores = buildCumulativeScores(rounds);
  const winnerId = getWinner(cumScores);
  const winnerPlayer = game.players.find((p) => p.player_id === winnerId);
  const isCompleted = game.status === 'completed';
  const isActive = game.status === 'active';

  const handleAbandon = () => {
    Alert.alert('Abandon', 'Abandon this game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Abandon',
        style: 'destructive',
        onPress: async () => {
          await abandonGame(game.id);
          clearGame();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.variantLabel}>
            {VARIANT_LABELS[game.variant]}
            {game.is_team_mode ? ' · Teams' : ''}
          </Text>
          <Text style={styles.roundCount}>
            {t('game.roundN', { n: rounds.length })} · {game.score_threshold} pts
          </Text>
        </View>
        {isActive && (
          <Pressable onPress={handleAbandon} style={styles.abandonBtn}>
            <Text style={styles.abandonText}>✕</Text>
          </Pressable>
        )}
      </View>

      {isCompleted && game.winner_id && (
        <View style={styles.winnerBanner}>
          <Text style={styles.winnerText}>
            🏆 {t('game.winnerIs', {
              name: game.players.find((p) => p.player_id === game.winner_id)?.name ?? '',
            })}
          </Text>
        </View>
      )}

      <View style={styles.boardContainer}>
        <Scoreboard
          players={game.players}
          rounds={rounds}
          threshold={game.score_threshold}
        />
      </View>

      {isActive && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push(`/game/round?gameId=${game.id}`)}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}

      {isCompleted && (
        <View style={styles.footer}>
          <Pressable
            style={styles.footerBtn}
            onPress={() => {
              clearGame();
              router.replace('/game/new');
            }}
          >
            <Text style={styles.footerBtnText}>{t('game.newGameAfter')}</Text>
          </Pressable>
        </View>
      )}

      <Modal visible={showGameOver} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('game.gameOver')}</Text>
            {winnerPlayer && (
              <Text style={styles.modalWinner}>
                {t('game.winnerIs', { name: winnerPlayer.name })}
              </Text>
            )}
            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                setShowGameOver(false);
                clearGame();
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  variantLabel: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  roundCount: {
    color: C.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  abandonBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#450a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  abandonText: {
    color: C.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  winnerBanner: {
    backgroundColor: C.primaryDim,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.primary,
  },
  winnerText: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  boardContainer: {
    flex: 1,
    backgroundColor: C.bg,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#000',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
  footerBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerBtnText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 16,
    width: 280,
    borderWidth: 1,
    borderColor: C.primary,
  },
  modalTitle: {
    color: C.text,
    fontSize: 24,
    fontWeight: '900',
  },
  modalWinner: {
    color: C.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  modalBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  modalBtnText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '800',
  },
});
