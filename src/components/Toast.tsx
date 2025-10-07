import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@theme';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Props = {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
};

export default function Toast({ 
  visible, 
  message, 
  type = 'info', 
  duration = 3000, 
  onHide 
}: Props) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  if (!visible) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          icon: 'checkmark-circle' as const,
          iconColor: 'white',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.danger,
          icon: 'close-circle' as const,
          iconColor: 'white',
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning,
          icon: 'warning' as const,
          iconColor: 'white',
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          icon: 'information-circle' as const,
          iconColor: 'white',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: config.backgroundColor }]}>
        <MaterialIcons name={config.icon} size={20} color={config.iconColor} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.lg,
    ...theme.shadows.lg,
    gap: theme.spacing(2),
  },
  message: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});



