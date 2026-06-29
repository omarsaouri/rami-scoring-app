import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SymbolView } from 'expo-symbols';

const ACTIVE = '#10B981';
const INACTIVE = '#4B5563';
const BG = '#111827';

type SFSymbolName = Parameters<typeof SymbolView>[0]['name'];

function TabIcon({ ios, color }: { ios: string; color: string | import('react-native').ColorValue }) {
  const name = { ios, android: ios, web: ios } as SFSymbolName;
  return <SymbolView name={name} tintColor={color as string} size={24} />;
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: '#1F2937',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <TabIcon ios="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarIcon: ({ color }) => <TabIcon ios="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('tabs.stats'),
          tabBarIcon: ({ color }) => (
            <TabIcon ios="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => (
            <TabIcon ios="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
