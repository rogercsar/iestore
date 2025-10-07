import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '@theme';
import Card from '@components/Card';
import HeaderMenu from '@components/HeaderMenu';

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    // Simular carregamento de dados do usuário
    setProfile({
      name: 'Admin',
      email: 'admin@iestore.netlify.app',
      phone: '(11) 99999-9999',
      company: 'inCRM Store',
      address: 'São Paulo, SP'
    });
  };

  const handleSave = async () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      Alert.alert('Erro', 'Nome e email são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Implementar logout
    Alert.alert('Logout', 'Funcionalidade de logout será implementada');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <HeaderMenu onLogout={handleLogout} />
      </View>

      <Card shadow="lg" style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            value={profile.name}
            onChangeText={(text) => setProfile({...profile, name: text})}
            style={styles.input}
            placeholder="Digite seu nome completo"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            value={profile.email}
            onChangeText={(text) => setProfile({...profile, email: text})}
            style={styles.input}
            placeholder="Digite seu email"
            placeholderTextColor={theme.colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            value={profile.phone}
            onChangeText={(text) => setProfile({...profile, phone: text})}
            style={styles.input}
            placeholder="Digite seu telefone"
            placeholderTextColor={theme.colors.muted}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Empresa</Text>
          <TextInput
            value={profile.company}
            onChangeText={(text) => setProfile({...profile, company: text})}
            style={styles.input}
            placeholder="Digite o nome da empresa"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Endereço</Text>
          <TextInput
            value={profile.address}
            onChangeText={(text) => setProfile({...profile, address: text})}
            style={[styles.input, styles.textArea]}
            placeholder="Digite seu endereço"
            placeholderTextColor={theme.colors.muted}
            multiline
            numberOfLines={3}
          />
        </View>

        <Pressable 
          disabled={loading} 
          onPress={handleSave} 
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
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Text>
          </LinearGradient>
        </Pressable>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  backButton: {
    padding: theme.spacing(1),
    marginRight: theme.spacing(2)
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1
  },
  profileCard: {
    margin: theme.spacing(2)
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2)
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5)
  },
  profileEmail: {
    fontSize: 16,
    color: theme.colors.muted
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
  textArea: {
    height: 80,
    textAlignVertical: 'top'
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
  }
});


