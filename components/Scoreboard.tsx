import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { GamePlayer, RoundWithScores } from '@/lib/db';
import { buildCumulativeScores } from '@/lib/scoring';

const C = {
  bg: '#0A0A0A',
  surface: '#111827',
  border: '#1F2937',
  primary: '#10B981',
  text: '#F9FAFB',
  textMuted: '#6B7280',
  win: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

const COL_WIDTH = 72;
const LABEL_WIDTH = 70;

interface Props {
  players: GamePlayer[];
  rounds: RoundWithScores[];
  threshold: number;
}

function scoreColor(score: number, threshold: number): string {
  if (score === 0) return C.win;
  if (score >= threshold * 0.8) return C.danger;
  if (score >= threshold * 0.5) return C.warning;
  return C.text;
}

function roundScoreColor(score: number): string {
  if (score === 0) return C.win;
  if (score === 100 || score === 200) return C.danger;
  if (score >= 60) return C.warning;
  return C.text;
}

export default function Scoreboard({ players, rounds, threshold }: Props) {
  const { t } = useTranslation();
  const cumScores = buildCumulativeScores(rounds);

  const sorted = [...players].sort((a, b) => {
    const sa = cumScores[a.player_id] ?? 0;
    const sb = cumScores[b.player_id] ?? 0;
    return sa - sb;
  });

  const leaderId = sorted[0]?.player_id;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.hScroll}
    >
      <View>
        {/* Header row */}
        <View style={styles.row}>
          <View style={[styles.labelCell, styles.headerCell]}>
            <Text style={styles.headerText}>{t('game.roundN', { n: '' }).replace('  ', '')}</Text>
          </View>
          {players.map((p) => (
            <View key={p.player_id} style={[styles.cell, styles.headerCell]}>
              <Text
                style={[styles.headerText, p.player_id === leaderId && styles.leadText]}
                numberOfLines={1}
              >
                {p.player_id === leaderId ? '★ ' : ''}{p.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Round rows */}
        <ScrollView style={styles.vScroll} showsVerticalScrollIndicator={false}>
          {rounds.map((round) => (
            <View key={round.id} style={styles.row}>
              <View style={styles.labelCell}>
                <Text style={styles.roundLabel}>{round.round_number}</Text>
              </View>
              {players.map((p) => {
                const scoreEntry = round.scores.find((s) => s.player_id === p.player_id);
                const score = scoreEntry?.score ?? null;
                return (
                  <View key={p.player_id} style={styles.cell}>
                    {score !== null ? (
                      <Text style={[styles.scoreText, { color: roundScoreColor(score) }]}>
                        {score === 0 ? '🏆' : String(score)}
                      </Text>
                    ) : (
                      <Text style={styles.emptyCell}>—</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {/* Total row */}
        <View style={[styles.row, styles.totalRow]}>
          <View style={[styles.labelCell, styles.totalCell]}>
            <Text style={styles.totalLabel}>{t('game.cumScore')}</Text>
          </View>
          {players.map((p) => {
            const total = cumScores[p.player_id] ?? 0;
            const isLead = p.player_id === leaderId;
            return (
              <View key={p.player_id} style={[styles.cell, styles.totalCell]}>
                <Text
                  style={[
                    styles.totalScore,
                    { color: scoreColor(total, threshold) },
                    isLead && styles.leadScore,
                  ]}
                >
                  {total}
                </Text>
                {total >= threshold && <Text style={styles.skull}>💀</Text>}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hScroll: {
    flex: 1,
  },
  vScroll: {
    maxHeight: 360,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  labelCell: {
    width: LABEL_WIDTH,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  cell: {
    width: COL_WIDTH,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  headerCell: {
    backgroundColor: '#0F172A',
  },
  headerText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  leadText: {
    color: C.primary,
  },
  roundLabel: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  emptyCell: {
    color: C.border,
    fontSize: 16,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: C.border,
  },
  totalCell: {
    backgroundColor: '#0F172A',
  },
  totalLabel: {
    color: C.text,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  totalScore: {
    fontSize: 20,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  leadScore: {
    textShadowColor: C.primary,
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 0 },
  },
  skull: {
    fontSize: 10,
    marginTop: 2,
  },
});
