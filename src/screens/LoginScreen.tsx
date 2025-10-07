import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@theme';
import Card from '@components/Card';

type Props = {
  onLogin: (token: string) => void;
};

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        // Generate a simple token
        const token = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        onLogin(token);
      } else {
        Alert.alert('Erro', 'Usuário ou senha incorretos');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialIcons name="storefront" size={60} color="white" />
        <Text style={styles.title}>IEStore</Text>
        <Text style={styles.subtitle}>Sistema de Gestão de Produtos</Text>
      </LinearGradient>

      <View style={styles.formCard}>
        <Card shadow="lg">
          <Text style={styles.formTitle}>Entrar no Sistema</Text>
          
          <View style={styles.formGroup}>
          <Text style={styles.label}>Usuário</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholder="Digite seu usuário"
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="none"
          />
          </View>

          <View style={styles.formGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor={theme.colors.muted}
            secureTextEntry
          />
          </View>

          <Pressable 
            disabled={loading} 
            onPress={handleLogin} 
            style={({ pressed }) => [
              styles.button, 
              pressed && { opacity: 0.8 }, 
              loading && { opacity: 0.6 }
            ]}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </LinearGradient>
          </Pressable>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing(3),
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginTop: theme.spacing(2)
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: theme.spacing(1)
  },
  formCard: {
    margin: theme.spacing(3),
    marginTop: -20
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing(3)
  },
  formGroup: {
    marginBottom: theme.spacing(3)
  },
  label: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing(1)
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1.5),
    fontSize: 16
  },
  button: {
    marginTop: theme.spacing(2),
    borderRadius: theme.radius.md,
    overflow: 'hidden'
  },
  buttonGradient: {
    paddingVertical: theme.spacing(2),
    alignItems: 'center',
    borderRadius: theme.radius.md
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16
  },
});



