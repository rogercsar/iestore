import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '@theme';
import Card from '@components/Card';
import Section from '@components/Section';
import { NotificationService } from '@services/NotificationService';
import { LocalData } from '@api/local';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      paymentReminders: true,
      lowStock: true,
      newSales: false,
      daysBeforeDue: 3
    },
    theme: {
      darkMode: false,
      primaryColor: '#007AFF'
    },
    audit: {
      enabled: true,
      logLevel: 'info'
    },
    backup: {
      autoBackup: false,
      backupFrequency: 'weekly'
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await LocalData.getSettings();
      if (savedSettings) {
        setSettings({ ...settings, ...savedSettings });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await LocalData.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Falha ao salvar configurações');
    }
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    };
    await saveSettings(newSettings);

    if (key === 'enabled' && value) {
      await NotificationService.requestPermissions();
    }
  };

  const handleThemeToggle = async (key: string, value: any) => {
    const newSettings = {
      ...settings,
      theme: {
        ...settings.theme,
        [key]: value
      }
    };
    await saveSettings(newSettings);
  };

  const handleAuditToggle = async (key: string, value: any) => {
    const newSettings = {
      ...settings,
      audit: {
        ...settings.audit,
        [key]: value
      }
    };
    await saveSettings(newSettings);
  };

  const handleBackupToggle = async (key: string, value: any) => {
    const newSettings = {
      ...settings,
      backup: {
        ...settings.backup,
        [key]: value
      }
    };
    await saveSettings(newSettings);
  };

  const handleExportData = async () => {
    try {
      const data = await LocalData.exportAllData();
      // Download JSON on web
      if (Platform.OS === 'web') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iestore-backup-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      Alert.alert('Sucesso', 'Dados exportados com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao exportar dados');
    }
  };

  const handleImportData = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Indisponível', 'Importar está disponível apenas na Web por enquanto.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv,text/csv,application/json';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (json.products) await AsyncStorage.setItem('iestore_products_v1', JSON.stringify(json.products));
          if (json.sales) await AsyncStorage.setItem('iestore_sales_v1', JSON.stringify(json.sales));
          if (json.customers) await AsyncStorage.setItem('customers', JSON.stringify(json.customers));
          if (json.settings) await AsyncStorage.setItem('app_settings', JSON.stringify(json.settings));
          Alert.alert('Sucesso', 'Backup restaurado com sucesso!');
        } else if (file.name.includes('sales')) {
          await LocalData.importSalesCSV(text);
          Alert.alert('Sucesso', 'Vendas importadas com sucesso!');
        } else if (file.name.includes('customers')) {
          await LocalData.importCustomersCSV(text);
          Alert.alert('Sucesso', 'Clientes importados com sucesso!');
        } else {
          // try both parsers
          try { await LocalData.importSalesCSV(text); Alert.alert('Sucesso', 'CSV de vendas importado!'); }
          catch { await LocalData.importCustomersCSV(text); Alert.alert('Sucesso', 'CSV de clientes importado!'); }
        }
      } catch (e) {
        Alert.alert('Erro', 'Falha ao importar arquivo');
      }
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const handleExportSalesCSV = async () => {
    try {
      const csv = await LocalData.exportSalesCSV();
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iestore-sales-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        Alert.alert('Indisponível', 'Exportar CSV disponível na Web por enquanto.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao exportar CSV de vendas');
    }
  };

  const handleExportCustomersCSV = async () => {
    try {
      const csv = await LocalData.exportCustomersCSV();
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iestore-customers-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        Alert.alert('Indisponível', 'Exportar CSV disponível na Web por enquanto.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao exportar CSV de clientes');
    }
  };

  const handleExportInventoryReport = async () => {
    try {
      const products = await LocalData.listProducts();
      const headers = ['Produto','Quantidade','Custo','Preço Unitário','Lucro Unitário'];
      const rows = [headers.join(',')].concat(
        products.map(p => [
          '"' + (p.name || '').replace(/"/g, '""') + '"',
          String(p.quantity ?? 0),
          String(p.cost ?? 0),
          String(p.unitPrice ?? 0),
          String((p.unitPrice ?? 0) - (p.cost ?? 0))
        ].join(','))
      );
      const csv = rows.join('\n');
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iestore-estoque-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        Alert.alert('Indisponível', 'Relatório disponível na Web por enquanto.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao exportar relatório de estoque');
    }
  };

  const handleExportSalesReport = async () => {
    try {
      const sales = await LocalData.salesHistory();
      const headers = ['Data','Tipo','Descrição','Total','Cliente','Pagamento','Status'];
      const escape = (v: any) => {
        if (v === undefined || v === null) return '';
        const s = String(v);
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      };
      const rows: string[] = [headers.join(',')];
      for (const s of sales) {
        if ('items' in s) {
          rows.push([
            s.dateISO,
            'Multipla',
            `${s.items.length} itens`,
            s.totalValue,
            s.customerName ?? '',
            s.paymentMethod ?? '',
            s.status ?? ''
          ].map(escape).join(','));
        } else {
          rows.push([
            s.dateISO,
            'Unica',
            s.product,
            s.totalValue,
            s.customerName ?? '',
            s.paymentMethod ?? '',
            s.status ?? ''
          ].map(escape).join(','));
        }
      }
      const csv = rows.join('\n');
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iestore-vendas-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        Alert.alert('Indisponível', 'Relatório disponível na Web por enquanto.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao exportar relatório de vendas');
    }
  };

  const handleExportProductsCSV = async () => {
    try {
      const csv = await LocalData.exportProductsCSV();
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iestore-products-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        Alert.alert('Indisponível', 'Exportar CSV disponível na Web por enquanto.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao exportar CSV de produtos');
    }
  };

  const handleImportProductsCSV = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Indisponível', 'Importar está disponível apenas na Web por enquanto.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        await LocalData.importProductsCSV(text);
        Alert.alert('Sucesso', 'Produtos importados com sucesso!');
      } catch (e) {
        Alert.alert('Erro', 'Falha ao importar CSV de produtos');
      }
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar Cache',
      'Tem certeza que deseja limpar o cache? Isso pode afetar o desempenho temporariamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocalData.clearCache();
              Alert.alert('Sucesso', 'Cache limpo com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao limpar cache');
            }
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    rightComponent 
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <MaterialIcons name={icon as any} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (onPress && <MaterialIcons name="chevron-forward" size={16} color={theme.colors.muted} />)}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.placeholder} />
      </View>

      <Section title="Notificações">
        <Card shadow="sm">
          <SettingItem
            title="Notificações"
            subtitle="Ativar/desativar todas as notificações"
            icon="notifications"
            rightComponent={
              <Switch
                value={settings.notifications.enabled}
                onValueChange={(value) => handleNotificationToggle('enabled', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.notifications.enabled ? 'white' : theme.colors.muted}
              />
            }
          />
          
          {settings.notifications.enabled && (
            <>
              <View style={styles.divider} />
              <SettingItem
                title="Lembretes de Pagamento"
                subtitle="Notificar sobre pagamentos próximos ao vencimento"
                icon="notification-important"
                rightComponent={
                  <Switch
                    value={settings.notifications.paymentReminders}
                    onValueChange={(value) => handleNotificationToggle('paymentReminders', value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={settings.notifications.paymentReminders ? 'white' : theme.colors.muted}
                  />
                }
              />
              
              <View style={styles.divider} />
              <SettingItem
                title="Estoque Baixo"
                subtitle="Notificar quando produtos estão com estoque baixo"
                icon="warning"
                rightComponent={
                  <Switch
                    value={settings.notifications.lowStock}
                    onValueChange={(value) => handleNotificationToggle('lowStock', value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={settings.notifications.lowStock ? 'white' : theme.colors.muted}
                  />
                }
              />
              
              <View style={styles.divider} />
              <SettingItem
                title="Novas Vendas"
                subtitle="Notificar sobre novas vendas registradas"
                icon="trending-up"
                rightComponent={
                  <Switch
                    value={settings.notifications.newSales}
                    onValueChange={(value) => handleNotificationToggle('newSales', value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={settings.notifications.newSales ? 'white' : theme.colors.muted}
                  />
                }
              />
            </>
          )}
        </Card>
      </Section>

      <Section title="Aparência">
        <Card shadow="sm">
          <SettingItem
            title="Modo Escuro"
            subtitle="Ativar tema escuro"
            icon="dark-mode"
            rightComponent={
              <Switch
                value={settings.theme.darkMode}
                onValueChange={(value) => handleThemeToggle('darkMode', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.theme.darkMode ? 'white' : theme.colors.muted}
              />
            }
          />
        </Card>
      </Section>

      <Section title="Auditoria">
        <Card shadow="sm">
          <SettingItem
            title="Log de Atividades"
            subtitle="Registrar todas as ações do sistema"
            icon="article"
            rightComponent={
              <Switch
                value={settings.audit.enabled}
                onValueChange={(value) => handleAuditToggle('enabled', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.audit.enabled ? 'white' : theme.colors.muted}
              />
            }
          />
        </Card>
      </Section>

      <Section title="Backup e Dados">
        <Card shadow="sm">
          <SettingItem
            title="Backup Automático"
            subtitle="Fazer backup automático dos dados"
            icon="cloud-upload"
            rightComponent={
              <Switch
                value={settings.backup.autoBackup}
                onValueChange={(value) => handleBackupToggle('autoBackup', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={settings.backup.autoBackup ? 'white' : theme.colors.muted}
              />
            }
          />
          
          <View style={styles.divider} />
          <SettingItem
            title="Relatório de Estoque (CSV)"
            subtitle="Exportar relatório do estoque"
            icon="inventory"
            onPress={handleExportInventoryReport}
          />

          <View style={styles.divider} />
          <SettingItem
            title="Relatório de Vendas (CSV)"
            subtitle="Exportar relatório de vendas"
            icon="receipt"
            onPress={handleExportSalesReport}
          />
          <SettingItem
            title="Exportar Dados"
            subtitle="Fazer backup manual dos dados"
            icon="download"
            onPress={handleExportData}
          />
          
          <View style={styles.divider} />
          <SettingItem
            title="Exportar Vendas (CSV)"
            subtitle="Baixar arquivo CSV com vendas"
            icon="table-view"
            onPress={handleExportSalesCSV}
          />

          <View style={styles.divider} />
          <SettingItem
            title="Exportar Clientes (CSV)"
            subtitle="Baixar arquivo CSV com clientes"
            icon="table-view"
            onPress={handleExportCustomersCSV}
          />

          <View style={styles.divider} />
          <SettingItem
            title="Exportar Produtos (CSV)"
            subtitle="Baixar arquivo CSV com produtos"
            icon="table-view"
            onPress={handleExportProductsCSV}
          />

          <View style={styles.divider} />
          <SettingItem
            title="Importar Dados"
            subtitle="Restaurar dados de backup"
            icon="cloud-download"
            onPress={handleImportData}
          />

          <View style={styles.divider} />
          <SettingItem
            title="Importar Produtos (CSV)"
            subtitle="Carregar produtos a partir de CSV"
            icon="cloud-download"
            onPress={handleImportProductsCSV}
          />
          
          <View style={styles.divider} />
          <SettingItem
            title="Limpar Cache"
            subtitle="Remover dados temporários"
            icon="delete"
            onPress={handleClearCache}
          />
          
          <View style={styles.divider} />
          <SettingItem
            title="Recalcular Estatísticas de Clientes"
            subtitle="Atualizar dados de compras dos clientes"
            icon="refresh"
            onPress={async () => {
              try {
                await LocalData.recalculateCustomerStats();
                Alert.alert('Sucesso', 'Estatísticas dos clientes foram recalculadas com sucesso!');
              } catch (error) {
                Alert.alert('Erro', 'Erro ao recalcular estatísticas dos clientes');
              }
            }}
          />
          <SettingItem
            title="Debug Storage"
            subtitle="Verificar dados armazenados (console)"
            icon="bug-report"
            onPress={async () => {
              await LocalData.debugStorage();
              Alert.alert('Debug', 'Verifique o console para ver os dados armazenados');
            }}
          />
        </Card>
      </Section>

      <Section title="Sobre">
        <Card shadow="sm">
          <SettingItem
            title="Versão"
            subtitle="1.0.0"
            icon="info"
          />
          
          <View style={styles.divider} />
          <SettingItem
            title="Suporte"
            subtitle="Obter ajuda e suporte"
            icon="help-outline"
            onPress={() => Alert.alert('Suporte', 'Entre em contato conosco para suporte técnico')}
          />
        </Card>
      </Section>
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
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  backButton: {
    padding: theme.spacing(1)
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text
  },
  placeholder: {
    width: 24
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(2)
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(2)
  },
  settingContent: {
    flex: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5)
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.muted
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 56
  }
});
