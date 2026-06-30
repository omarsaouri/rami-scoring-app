import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import VariantPicker from '@/components/VariantPicker';
import { createGame } from '@/lib/db';
import { THRESHOLDS } from '@/lib/rules';
import { useGameStore } from '@/store/gameStore';
import type { GameVariant } from '@/lib/db';
import { Colors } from '@/constants/theme';

const C = { ...Colors, border: Colors.borderLight };

export default function NewGameScreen() {
  const { t } = useTranslation();
  const { setActiveGame, setRounds } = useGameStore();

  const [variant, setVariant] = useState<GameVariant>('71');
  const [players, setPlayers] = useState(['', '']);
  const [threshold, setThreshold] = useState(1001);
  const [teamMode, setTeamMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const addPlayer = () => {
    if (players.length < 6) setPlayers([...players, '']);
  };

  const removePlayer = (i: number) => {
    if (players.length > 2) {
      const next = [...players];
      next.splice(i, 1);
      setPlayers(next);
      if (next.length !== 4) setTeamMode(false);
    }
  };

  const updatePlayer = (i: number, name: string) => {
    const next = [...players];
    next[i] = name;
    setPlayers(next);
  };

  const canStart = players.every((n) => n.trim().length > 0) && players.length >= 2;
  const showTeamToggle = players.length === 4;

  const handleStart = async () => {
    if (!canStart) {
      Alert.alert('', 'Enter a name for each player');
      return;
    }
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const playerDefs = players.map((name, i) => ({
        name: name.trim(),
        team: teamMode
          ? i % 2 === 0 ? 1 : 2
          : undefined,
      }));
      const game = await createGame({
        variant,
        score_threshold: threshold,
        is_team_mode: teamMode,
        players: playerDefs,
      });
      setActiveGame(game);
      setRounds([]);
      router.replace(`/game/${game.id}`);
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>{t('game.new')}</Text>

        <Section title={t('game.variant')}>
          <VariantPicker selected={variant} onSelect={setVariant} />
        </Section>

        <Section title={t('game.players')}>
          {players.map((name, i) => (
            <View key={i} style={styles.playerRow}>
              <TextInput
                style={styles.playerInput}
                value={name}
                onChangeText={(v) => updatePlayer(i, v)}
                placeholder={`${t('common.player')} ${i + 1}`}
                placeholderTextColor={C.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {players.length > 2 && (
                <Pressable onPress={() => removePlayer(i)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}
          {players.length < 6 && (
            <Pressable style={styles.addBtn} onPress={addPlayer}>
              <Text style={styles.addBtnText}>+ {t('common.addPlayer')}</Text>
            </Pressable>
          )}
        </Section>

        <Section title={t('game.threshold')}>
          <View style={styles.thresholdRow}>
            {THRESHOLDS.map((v) => (
              <Pressable
                key={v}
                style={[styles.threshBtn, threshold === v && styles.threshBtnActive]}
                onPress={() => setThreshold(v)}
              >
                <Text style={[styles.threshText, threshold === v && styles.threshTextActive]}>
                  {v}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        {showTeamToggle && (
          <Section title={t('game.teamMode')}>
            <View style={styles.teamRow}>
              <View style={styles.teamInfo}>
                <Text style={styles.teamLabel}>{t('game.teamMode')}</Text>
                <Text style={styles.teamSubLabel}>
                  {teamMode ? 'Équipe 1: J1+J3 / Équipe 2: J2+J4' : 'Solo play'}
                </Text>
              </View>
              <Switch
                value={teamMode}
                onValueChange={setTeamMode}
                trackColor={{ false: C.surface2, true: C.primaryDim }}
                thumbColor={teamMode ? C.primary : C.textMuted}
              />
            </View>
          </Section>
        )}

        <Pressable
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
          onPress={handleStart}
          disabled={!canStart || loading}
        >
          <Text style={styles.startBtnText}>
            {loading ? '...' : t('game.start')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, gap: 24, paddingBottom: 40 },
  pageTitle: {
    color: C.text,
    fontSize: 28,
    fontWeight: '900',
  },
  section: { gap: 10 },
  sectionTitle: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  playerRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  playerInput: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 13,
    color: C.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#450a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: C.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  addBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: C.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  addBtnText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  thresholdRow: {
    flexDirection: 'row',
    gap: 10,
  },
  threshBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: C.surface,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
  },
  threshBtnActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryDim,
  },
  threshText: {
    color: C.textMuted,
    fontSize: 18,
    fontWeight: '700',
  },
  threshTextActive: {
    color: C.primary,
  },
  teamRow: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  teamInfo: { gap: 3, flex: 1 },
  teamLabel: { color: C.text, fontSize: 16, fontWeight: '600' },
  teamSubLabel: { color: C.textMuted, fontSize: 12 },
  startBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  startBtnDisabled: {
    backgroundColor: C.primaryDim,
    opacity: 0.5,
  },
  startBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
  },
});
