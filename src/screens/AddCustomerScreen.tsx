import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '@theme';
import { LocalData } from '@api/local';
import { Customer } from '@types';
import Card from '@components/Card';
import Toast from '@components/Toast';
import { useToast } from '../hooks/useToast';

export default function AddCustomerScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, hideToast, showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      showError('Nome e telefone são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const newCustomer: Customer = {
        id: Date.now().toString(), // Simple ID generation
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        totalPurchases: 0,
        totalValue: 0,
        pendingAmount: 0,
        notes: notes.trim() || undefined
      };

      await LocalData.saveCustomer(newCustomer);
      
      showSuccess('Cliente adicionado com sucesso!');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (e: any) {
      showError(e?.message ?? 'Falha ao adicionar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card shadow="lg">
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <MaterialIcons name="person-add" size={32} color={theme.colors.primary} />
            <Text style={styles.title}>Adicionar Cliente</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Nome completo do cliente"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Telefone *</Text>
          <TextInput
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="(11) 99999-9999"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="cliente@email.com (opcional)"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Endereço</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            placeholder="Endereço completo (opcional)"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.textArea]}
            placeholder="Observações sobre o cliente (opcional)"
            placeholderTextColor={theme.colors.muted}
            multiline
            numberOfLines={3}
          />
        </View>

        <Pressable
          disabled={loading}
          onPress={handleSubmit}
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
              {loading ? 'Adicionando...' : 'Adicionar Cliente'}
            </Text>
          </LinearGradient>
        </Pressable>
      </Card>
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing(2)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  backButton: {
    padding: theme.spacing(1),
    marginRight: theme.spacing(2)
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing(2)
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text
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
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: theme.spacing(1.5)
  },
  button: {
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
