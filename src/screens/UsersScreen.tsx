import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '@theme';
import Card from '@components/Card';
import HeaderMenu from '@components/HeaderMenu';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
};

export default function UsersScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Funcionalidade de logout será implementada');
  };

  async function loadUsers() {
    try {
      const res = await fetch('/.netlify/functions/sheets?table=users');
      if (res.ok) {
        const list = await res.json();
        const parsed: User[] = Array.isArray(list)
          ? list.map((u: any) => ({
              id: u.id || String(Date.now() + Math.random()),
              name: u.name || '',
              email: u.email || '',
              role: (u.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
              status: (u.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive'
            }))
          : [];
        setUsers(parsed);
      }
    } catch (e) {
      // ignore
    }
  }

  async function syncUsers(next: User[]) {
    try {
      const rows = next.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status
      }));
      await fetch('/.netlify/functions/sheets?table=users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'overwrite', rows })
      });
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        status: 'active'
      };

      const next = [...users, user];
      setUsers(next);
      await syncUsers(next);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setShowAddForm(false);
      Alert.alert('Sucesso', 'Usuário criado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const next = users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    );
    setUsers(next);
    await syncUsers(next);
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Excluir Usuário',
      'Tem certeza que deseja excluir este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            const next = users.filter(user => user.id !== userId);
            setUsers(next);
            await syncUsers(next);
          }
        }
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <Card shadow="sm" style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.userBadges}>
            <View style={[styles.badge, { 
              backgroundColor: item.role === 'admin' ? theme.colors.primary : theme.colors.success 
            }]}>
              <Text style={styles.badgeText}>
                {item.role === 'admin' ? 'Admin' : 'Usuário'}
              </Text>
            </View>
            <View style={[styles.badge, { 
              backgroundColor: item.status === 'active' ? theme.colors.success : theme.colors.danger 
            }]}>
              <Text style={styles.badgeText}>
                {item.status === 'active' ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.userActions}>
          <TouchableOpacity 
            onPress={() => handleToggleUserStatus(item.id)}
            style={styles.actionButton}
          >
            <MaterialIcons 
              name={item.status === 'active' ? 'pause' : 'play-arrow'} 
              size={20} 
              color={item.status === 'active' ? theme.colors.warning : theme.colors.success} 
            />
          </TouchableOpacity>
          {item.role !== 'admin' && (
            <TouchableOpacity 
              onPress={() => handleDeleteUser(item.id)}
              style={styles.actionButton}
            >
              <MaterialIcons name="delete" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuários</Text>
        <HeaderMenu onLogout={handleLogout} />
      </View>

      {/* Add User Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity 
          onPress={() => setShowAddForm(true)}
          style={styles.addButton}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Adicionar Usuário</Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Add User Modal */}
      {showAddForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Usuário</Text>
              <TouchableOpacity 
                onPress={() => setShowAddForm(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome Completo *</Text>
                <TextInput
                  value={newUser.name}
                  onChangeText={(text) => setNewUser({...newUser, name: text})}
                  style={styles.input}
                  placeholder="Digite o nome completo"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  value={newUser.email}
                  onChangeText={(text) => setNewUser({...newUser, email: text})}
                  style={styles.input}
                  placeholder="Digite o email"
                  placeholderTextColor={theme.colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Senha *</Text>
                <TextInput
                  value={newUser.password}
                  onChangeText={(text) => setNewUser({...newUser, password: text})}
                  style={styles.input}
                  placeholder="Digite a senha"
                  placeholderTextColor={theme.colors.muted}
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo de Usuário</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      newUser.role === 'user' && styles.roleButtonActive
                    ]}
                    onPress={() => setNewUser({...newUser, role: 'user'})}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      newUser.role === 'user' && styles.roleButtonTextActive
                    ]}>
                      Usuário
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      newUser.role === 'admin' && styles.roleButtonActive
                    ]}
                    onPress={() => setNewUser({...newUser, role: 'admin'})}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      newUser.role === 'admin' && styles.roleButtonTextActive
                    ]}>
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                onPress={() => setShowAddForm(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <Pressable 
                disabled={loading} 
                onPress={handleAddUser} 
                style={({ pressed }) => [
                  styles.saveButton, 
                  pressed && { opacity: 0.8 }, 
                  loading && { opacity: 0.6 }
                ]}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight]}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? 'Criando...' : 'Criar Usuário'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
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
  addButtonContainer: {
    padding: theme.spacing(2)
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.md,
    gap: theme.spacing(1)
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  },
  listContainer: {
    padding: theme.spacing(2),
    gap: theme.spacing(2)
  },
  userCard: {
    padding: theme.spacing(2)
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5)
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing(1)
  },
  userBadges: {
    flexDirection: 'row',
    gap: theme.spacing(1)
  },
  badge: {
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(0.5),
    borderRadius: theme.radius.sm
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  userActions: {
    flexDirection: 'row',
    gap: theme.spacing(1)
  },
  actionButton: {
    padding: theme.spacing(1),
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    width: '90%',
    maxHeight: '80%',
    ...theme.shadows.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text
  },
  closeButton: {
    padding: theme.spacing(0.5)
  },
  modalBody: {
    padding: theme.spacing(3),
    maxHeight: 400
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
  roleButtons: {
    flexDirection: 'row',
    gap: theme.spacing(2)
  },
  roleButton: {
    flex: 1,
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(3),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center'
  },
  roleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text
  },
  roleButtonTextActive: {
    color: 'white'
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing(3),
    gap: theme.spacing(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text
  },
  saveButton: {
    flex: 1,
    borderRadius: theme.radius.md,
    overflow: 'hidden'
  },
  saveButtonGradient: {
    paddingVertical: theme.spacing(2),
    alignItems: 'center'
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16
  }
});


