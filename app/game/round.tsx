import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import ScoreInput from '@/components/ScoreInput';
import { getGame, getRounds, addRound, completeGame } from '@/lib/db';
import { computeRoundScores, buildCumulativeScores, isGameOver, getWinner } from '@/lib/scoring';
import { DEFAULT_RULES } from '@/lib/rules';
import { useGameStore } from '@/store/gameStore';
import type { GameWithPlayers } from '@/lib/db';
import type { TeamConfig } from '@/lib/scoring';

const C = {
  bg: '#0A0A0A',
  surface: '#111827',
  border: '#1F2937',
  primary: '#10B981',
  primaryDim: '#065F46',
  text: '#F9FAFB',
  textMuted: '#6B7280',
  danger: '#EF4444',
};

interface PlayerState {
  playerId: string;
  name: string;
  posed: boolean;
  cardTotal: number;
  isWinner: boolean;
}

export default function RoundScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { t } = useTranslation();
  const { setActiveGame, setRounds, clearGame } = useGameStore();

  const [game, setGame] = useState<GameWithPlayers | null>(null);
  const [playerStates, setPlayerStates] = useState<PlayerState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gameOverModal, setGameOverModal] = useState<{ winnerId: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      if (!gameId) return;
      const g = await getGame(gameId);
      setGame(g);
      if (g) {
        setPlayerStates(
          g.players.map((p) => ({
            playerId: p.player_id,
            name: p.name,
            posed: true,
            cardTotal: 0,
            isWinner: false,
          }))
        );
      }
      setLoading(false);
    })();
  }, [gameId]);

  const toggleWinner = (playerId: string) => {
    setPlayerStates((prev) =>
      prev.map((s) =>
        s.playerId === playerId
          ? { ...s, isWinner: !s.isWinner, posed: true, cardTotal: 0 }
          : { ...s, isWinner: false }
      )
    );
  };

  const updatePosed = (playerId: string, posed: boolean) => {
    setPlayerStates((prev) =>
      prev.map((s) =>
        s.playerId === playerId
          ? { ...s, posed, isWinner: posed ? s.isWinner : false }
          : s
      )
    );
  };

  const updateScore = (playerId: string, score: number) => {
    setPlayerStates((prev) =>
      prev.map((s) => (s.playerId === playerId ? { ...s, cardTotal: score } : s))
    );
  };

  const handleSave = async () => {
    if (!game || !gameId) return;

    const winner = playerStates.find((s) => s.isWinner);
    if (!winner) {
      Alert.alert('', t('round.selectWinner'));
      return;
    }

    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      let teamConfig: TeamConfig | null = null;
      if (game.is_team_mode && game.players.length === 4) {
        teamConfig = {
          team1: game.players.filter((p) => p.team === 1).map((p) => p.player_id),
          team2: game.players.filter((p) => p.team === 2).map((p) => p.player_id),
        };
      }

      const inputs = playerStates.map((s) => ({
        playerId: s.playerId,
        hasPosed: s.posed,
        cardTotal: s.isWinner ? 0 : s.cardTotal,
        isWinner: s.isWinner,
      }));

      const roundScores = computeRoundScores(inputs, game.variant, teamConfig, DEFAULT_RULES);

      const playerScores = Object.entries(roundScores).map(([playerId, score]) => ({
        player_id: playerId,
        score,
        has_posed: playerStates.find((s) => s.playerId === playerId)?.posed ?? false,
      }));

      await addRound(gameId, winner.playerId, null, playerScores);

      const allRounds = await getRounds(gameId);
      setRounds(allRounds);
      setActiveGame(game);

      const cum = buildCumulativeScores(allRounds);
      const { over, loser } = isGameOver(cum, game.score_threshold);

      if (over && loser) {
        const winnerId = getWinner(cum);
        if (winnerId) {
          await completeGame(gameId, winnerId);
          const updatedGame = await getGame(gameId);
          if (updatedGame) setActiveGame(updatedGame);
        }
        setGameOverModal({ winnerId: winnerId ?? null });
      } else {
        router.back();
      }
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setSaving(false);
    }
  };

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

  const winnerPlayer = game.players.find(
    (p) => p.player_id === gameOverModal?.winnerId
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>{t('round.enterScores')}</Text>

        {playerStates.map((s) => (
          <ScoreInput
            key={s.playerId}
            playerName={s.name}
            isWinner={s.isWinner}
            onWinnerToggle={() => toggleWinner(s.playerId)}
            posed={s.posed}
            cardTotal={s.cardTotal}
            onPosedChange={(posed) => updatePosed(s.playerId, posed)}
            onScoreChange={(score) => updateScore(s.playerId, score)}
          />
        ))}

        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? '...' : t('round.save')}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal visible={gameOverModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('game.gameOver')}</Text>
            {winnerPlayer && (
              <Text style={styles.modalWinner}>
                🏆 {t('game.winnerIs', { name: winnerPlayer.name })}
              </Text>
            )}
            <Pressable
              style={styles.modalBtn}
              onPress={() => {
                setGameOverModal(null);
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
  scroll: { padding: 16, paddingBottom: 40, gap: 4 },
  pageTitle: {
    color: C.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
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
