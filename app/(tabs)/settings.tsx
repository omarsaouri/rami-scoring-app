import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

const C = {
  bg: '#0A0A0A',
  surface: '#111827',
  border: '#1F2937',
  primary: '#10B981',
  primaryDim: '#065F46',
  text: '#F9FAFB',
  textMuted: '#6B7280',
};

const LANGUAGES = [
  { code: 'fr', label: 'Français', native: 'Français' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ar', label: 'العربية (دارجة)', native: 'العربية' },
];

const CARD_VALUES = [
  { card: '2–10', value: 'Face value' },
  { card: 'Valet / Dame / Roi', value: '10 pts' },
  { card: 'As', value: '10 pts (always)' },
  { card: 'Joker', value: '0 pts (in combo)' },
];

export default function SettingsScreen() {
  const { t, i18n: i18nInstance } = useTranslation();
  const currentLang = i18nInstance.language;

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>{t('tabs.settings')}</Text>

        <Section title={t('settings.language')}>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              style={[
                styles.langRow,
                currentLang === lang.code && styles.langRowActive,
              ]}
              onPress={() => changeLanguage(lang.code)}
            >
              <Text
                style={[
                  styles.langLabel,
                  currentLang === lang.code && styles.langLabelActive,
                ]}
              >
                {lang.native}
              </Text>
              {currentLang === lang.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </Pressable>
          ))}
        </Section>

        <Section title={t('settings.cardValues')}>
          {CARD_VALUES.map((row) => (
            <View key={row.card} style={styles.ruleRow}>
              <Text style={styles.ruleCard}>{row.card}</Text>
              <Text style={styles.ruleValue}>{row.value}</Text>
            </View>
          ))}
        </Section>

        <Section title={t('settings.penalties')}>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleCard}>Jamais posé</Text>
            <Text style={styles.ruleValue}>100 pts</Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleCard}>Équipe (aucun posé)</Text>
            <Text style={styles.ruleValue}>200 pts</Text>
          </View>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleCard}>Gagnant</Text>
            <Text style={styles.ruleValue}>0 pts</Text>
          </View>
        </Section>

        <Section title={t('settings.thresholds')}>
          <View style={styles.ruleRow}>
            <Text style={styles.ruleCard}>Options</Text>
            <Text style={styles.ruleValue}>501 / 701 / 1001</Text>
          </View>
          <Text style={styles.ruleNote}>
            Le joueur qui dépasse le seuil est éliminé. Le score le plus bas gagne.
          </Text>
        </Section>

        <Section title={t('settings.about')}>
          <Text style={styles.aboutText}>Rami Score v1.0</Text>
          <Text style={styles.aboutSubtext}>
            Suivi de scores pour le Rami Marocain (Simple, 71, 71 Bla Joker)
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, gap: 24 },
  pageTitle: {
    color: C.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  section: { gap: 10 },
  sectionTitle: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionBody: {
    backgroundColor: C.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  langRowActive: {
    backgroundColor: C.primaryDim,
  },
  langLabel: {
    color: C.text,
    fontSize: 16,
    fontWeight: '500',
  },
  langLabelActive: {
    color: C.primary,
    fontWeight: '700',
  },
  checkmark: {
    color: C.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  ruleCard: {
    color: C.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  ruleValue: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  ruleNote: {
    color: C.textMuted,
    fontSize: 12,
    padding: 12,
    lineHeight: 18,
  },
  aboutText: {
    color: C.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  aboutSubtext: {
    color: C.textMuted,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 14,
    lineHeight: 18,
  },
});
