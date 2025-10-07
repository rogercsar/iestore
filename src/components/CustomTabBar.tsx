import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@theme';

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

export default function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const tabIcons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    Dashboard: 'home',
    Estoque: 'inventory',
    Vender: 'add-circle',
    Historico: 'list'
  };

  const tabLabels: Record<string, string> = {
    Dashboard: 'Dashboard',
    Estoque: 'Estoque',
    Vender: 'Vender',
    Historico: 'Histórico'
  };

  // Filter to only show main tabs
  const mainTabs = ['Dashboard', 'Estoque', 'Vender', 'Historico'];
  const filteredRoutes = state.routes.filter((route: any) => mainTabs.includes(route.name));

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {filteredRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const originalIndex = state.routes.findIndex((r: any) => r.key === route.key);
          const isFocused = state.index === originalIndex;
          const iconName = tabIcons[route.name] || 'circle';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {isFocused ? (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  style={styles.activeTab}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name={iconName} size={22} color="white" />
                  <Text style={styles.activeLabel}>{tabLabels[route.name]}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <MaterialIcons name={iconName} size={22} color={theme.colors.muted} />
                  <Text style={styles.inactiveLabel}>{tabLabels[route.name]}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 8,
    paddingTop: 8
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(1)
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing(1),
    paddingHorizontal: theme.spacing(1)
  },
  activeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.lg,
    gap: theme.spacing(1),
    ...theme.shadows.sm
  },
  inactiveTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.lg,
    gap: theme.spacing(1)
  },
  activeLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'System'
  },
  inactiveLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'System'
  }
});
