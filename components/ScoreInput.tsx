import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';

const C = { ...Colors, border: Colors.borderLight };

const QUICK_VALUES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

interface Props {
  playerName: string;
  isWinner: boolean;
  onWinnerToggle: () => void;
  posed: boolean;
  cardTotal: number;
  onPosedChange: (posed: boolean) => void;
  onScoreChange: (score: number) => void;
}

export default function ScoreInput({
  playerName,
  isWinner,
  onWinnerToggle,
  posed,
  cardTotal,
  onPosedChange,
  onScoreChange,
}: Props) {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState(String(cardTotal));

  useEffect(() => {
    setInputText(String(cardTotal));
  }, [cardTotal]);

  const handleTextChange = (text: string) => {
    setInputText(text);
    const val = parseInt(text, 10);
    if (!isNaN(val) && val >= 0) {
      onScoreChange(val);
    }
  };

  const handleQuick = (val: number) => {
    setInputText(String(val));
    onScoreChange(val);
    if (val === 0) {
      onWinnerToggle();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.playerName}>{playerName}</Text>
        <Pressable
          style={[styles.winnerBadge, isWinner && styles.winnerBadgeActive]}
          onPress={onWinnerToggle}
        >
          <Text style={[styles.winnerText, isWinner && styles.winnerTextActive]}>
            {isWinner ? '🏆 ' + t('round.winner') : t('round.winner') + '?'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.poseRow}>
        <Pressable
          style={[styles.poseBtn, posed && styles.poseBtnActive]}
          onPress={() => onPosedChange(true)}
        >
          <Text style={[styles.poseBtnText, posed && styles.poseBtnTextActive]}>
            {t('round.posed')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.poseBtn, !posed && styles.poseBtnDanger]}
          onPress={() => onPosedChange(false)}
        >
          <Text style={[styles.poseBtnText, !posed && styles.poseBtnDangerText]}>
            {t('round.notPosed')}
          </Text>
        </Pressable>
      </View>

      {!posed ? (
        <View style={styles.penaltyBox}>
          <Text style={styles.penaltyText}>{t('round.flatPenalty')}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>{t('round.cardTotal')}</Text>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleTextChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={C.textMuted}
            selectTextOnFocus
          />
          <Text style={styles.sectionLabel}>{t('round.quickValues')}</Text>
          <View style={styles.quickGrid}>
            {QUICK_VALUES.map((v) => (
              <Pressable
                key={v}
                style={[
                  styles.quickBtn,
                  cardTotal === v && styles.quickBtnActive,
                ]}
                onPress={() => handleQuick(v)}
              >
                <Text
                  style={[
                    styles.quickBtnText,
                    cardTotal === v && styles.quickBtnTextActive,
                  ]}
                >
                  {v}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    color: C.text,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  winnerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  winnerBadgeActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryDim,
  },
  winnerText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  winnerTextActive: {
    color: C.primary,
  },
  poseRow: {
    flexDirection: 'row',
    gap: 8,
  },
  poseBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
  },
  poseBtnActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryDim,
  },
  poseBtnDanger: {
    borderColor: C.danger,
    backgroundColor: '#450a0a',
  },
  poseBtnText: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  poseBtnTextActive: {
    color: C.primary,
  },
  poseBtnDangerText: {
    color: C.danger,
  },
  penaltyBox: {
    backgroundColor: '#450a0a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  penaltyText: {
    color: C.danger,
    fontWeight: '700',
    fontSize: 15,
  },
  sectionLabel: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: C.surface2,
    borderRadius: 8,
    padding: 12,
    color: C.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: C.border,
    fontVariant: ['tabular-nums'],
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickBtn: {
    backgroundColor: C.surface2,
    borderRadius: 8,
    width: 52,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  quickBtnActive: {
    backgroundColor: C.primaryDim,
    borderColor: C.primary,
  },
  quickBtnText: {
    color: C.text,
    fontSize: 14,
    fontWeight: '600',
  },
  quickBtnTextActive: {
    color: C.primary,
  },
});
