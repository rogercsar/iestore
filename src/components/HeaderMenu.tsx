import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '@theme';

type Props = {
  onLogout: () => Promise<void>;
};

export default function HeaderMenu({ onLogout }: Props) {
  const navigation = useNavigation();
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    {
      icon: 'person' as keyof typeof MaterialIcons.glyphMap,
      label: 'Perfil',
      color: theme.colors.primary,
      onPress: () => {
        navigation.navigate('Profile' as never);
        setShowMenu(false);
      }
    },
    {
      icon: 'group' as keyof typeof MaterialIcons.glyphMap,
      label: 'Usuários',
      color: theme.colors.success,
      onPress: () => {
        navigation.navigate('Users' as never);
        setShowMenu(false);
      }
    },
    {
      icon: 'person' as keyof typeof MaterialIcons.glyphMap,
      label: 'Clientes',
      color: theme.colors.primary,
      onPress: () => {
        navigation.navigate('Customers' as never);
        setShowMenu(false);
      }
    },
    {
      icon: 'settings' as keyof typeof MaterialIcons.glyphMap,
      label: 'Configurações',
      color: theme.colors.muted,
      onPress: () => {
        navigation.navigate('Settings' as never);
        setShowMenu(false);
      }
    },
    {
      icon: 'logout' as keyof typeof MaterialIcons.glyphMap,
      label: 'Sair',
      color: theme.colors.danger,
      onPress: async () => {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const confirmed = window.confirm('Tem certeza que deseja sair do sistema?');
          if (confirmed) {
            await onLogout();
            setShowMenu(false);
          }
          return;
        }
        Alert.alert(
          'Confirmar Saída',
          'Tem certeza que deseja sair do sistema?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sair',
              style: 'destructive',
              onPress: async () => {
                await onLogout();
                setShowMenu(false);
              }
            }
          ]
        );
      }
    }
  ];

  return (
    <>
      <TouchableOpacity 
        onPress={() => setShowMenu(true)}
        style={styles.menuButton}
      >
        <MaterialIcons name="menu" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showMenu}
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.backdrop} 
            onPress={() => setShowMenu(false)} 
          />
          <View style={styles.menu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity 
                onPress={() => setShowMenu(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                  <Text style={[styles.menuLabel, { color: item.color }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  backdrop: {
    flex: 1
  },
  menu: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing(3),
    ...theme.shadows.lg
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text
  },
  closeButton: {
    padding: theme.spacing(0.5)
  },
  menuItems: {
    gap: theme.spacing(1)
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing(2)
  }
});
