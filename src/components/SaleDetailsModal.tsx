import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@theme';
import { Sale, MultiSale, Installment } from '@types';
import { formatCurrencyBRL, formatDateBR } from '@utils/format';
import Card from './Card';

type Props = {
  sale: Sale | MultiSale;
  visible: boolean;
  onClose: () => void;
};

export default function SaleDetailsModal({ sale, visible, onClose }: Props) {
  const isMultiSale = 'items' in sale;
  const hasInstallments = sale.installments && sale.installments.length > 0;

  const handleWhatsAppReceipt = () => {
    if (!sale.customerPhone) {
      Alert.alert('Erro', 'Telefone do cliente não informado');
      return;
    }

    const message = `📋 *Comprovante de Venda*\n\n` +
      `🛍️ *Produto(s):*\n` +
      (isMultiSale 
        ? sale.items.map(item => `• ${item.product} (${item.quantity}x) - ${formatCurrencyBRL(item.totalValue)}`).join('\n')
        : `• ${sale.product} (${sale.quantity}x) - ${formatCurrencyBRL(sale.totalValue)}`
      ) +
      `\n\n💰 *Total: ${formatCurrencyBRL(sale.totalValue)}*\n` +
      `📅 *Data: ${formatDateBR(sale.dateISO)}*\n` +
      `💳 *Pagamento: ${sale.paymentMethod || 'Não informado'}*\n\n` +
      `Obrigado pela preferência! 🎉`;

    const whatsappUrl = `whatsapp://send?phone=${sale.customerPhone}&text=${encodeURIComponent(message)}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'partial': return theme.colors.primary;
      default: return theme.colors.muted;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'partial': return 'Parcial';
      default: return 'Não informado';
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Detalhes da Venda</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Informações do Cliente */}
            {sale.customerName && (
              <Card shadow="sm" style={styles.section}>
                <Text style={styles.sectionTitle}>Cliente</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Nome:</Text>
                  <Text style={styles.value}>{sale.customerName}</Text>
                </View>
                {sale.customerPhone && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Telefone:</Text>
                    <Text style={styles.value}>{sale.customerPhone}</Text>
                  </View>
                )}
              </Card>
            )}

            {/* Produtos */}
            <Card shadow="sm" style={styles.section}>
              <Text style={styles.sectionTitle}>Produtos</Text>
              {isMultiSale ? (
                sale.items.map((item, index) => (
                  <View key={index} style={styles.productItem}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.product}</Text>
                      <Text style={styles.productQuantity}>Qtd: {item.quantity}</Text>
                    </View>
                    <View style={styles.productValues}>
                      <Text style={styles.productPrice}>{formatCurrencyBRL(item.unitPrice)}</Text>
                      <Text style={styles.productTotal}>{formatCurrencyBRL(item.totalValue)}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.productItem}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{sale.product}</Text>
                    <Text style={styles.productQuantity}>Qtd: {sale.quantity}</Text>
                  </View>
                  <View style={styles.productValues}>
                    <Text style={styles.productPrice}>{formatCurrencyBRL(sale.totalValue / sale.quantity)}</Text>
                    <Text style={styles.productTotal}>{formatCurrencyBRL(sale.totalValue)}</Text>
                  </View>
                </View>
              )}
            </Card>

            {/* Resumo Financeiro */}
            <Card shadow="sm" style={styles.section}>
              <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Total da Venda:</Text>
                <Text style={[styles.value, { color: theme.colors.primary, fontWeight: '700' }]}>
                  {formatCurrencyBRL(sale.totalValue)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Custo Total:</Text>
                <Text style={styles.value}>
                  {formatCurrencyBRL(isMultiSale ? sale.totalCost : sale.totalCost)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Lucro:</Text>
                <Text style={[styles.value, { color: theme.colors.success, fontWeight: '700' }]}>
                  {formatCurrencyBRL(isMultiSale ? sale.totalProfit : sale.profit)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Status:</Text>
                <Text style={[styles.value, { color: getStatusColor(sale.status) }]}>
                  {getStatusText(sale.status)}
                </Text>
              </View>
            </Card>

            {/* Parcelas */}
            {hasInstallments && (
              <Card shadow="sm" style={styles.section}>
                <Text style={styles.sectionTitle}>Parcelas</Text>
                {sale.installments!.map((installment, index) => (
                  <View key={index} style={styles.installmentItem}>
                    <View style={styles.installmentInfo}>
                      <Text style={styles.installmentNumber}>Parcela {installment.number}</Text>
                      <Text style={styles.installmentDate}>
                        Vencimento: {formatDateBR(installment.dueDate)}
                      </Text>
                      {installment.paidDate && (
                        <Text style={styles.installmentPaid}>
                          Pago em: {formatDateBR(installment.paidDate)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.installmentValues}>
                      <Text style={styles.installmentValue}>
                        {formatCurrencyBRL(installment.value)}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(installment.status) }]}>
                        <Text style={styles.statusText}>
                          {installment.status === 'paid' ? 'Pago' : 
                           installment.status === 'overdue' ? 'Vencido' : 'Pendente'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </Card>
            )}

            {/* Informações da Venda */}
            <Card shadow="sm" style={styles.section}>
              <Text style={styles.sectionTitle}>Informações da Venda</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Data:</Text>
                <Text style={styles.value}>{formatDateBR(sale.dateISO)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Forma de Pagamento:</Text>
                <Text style={styles.value}>{sale.paymentMethod || 'Não informado'}</Text>
              </View>
            </Card>
          </ScrollView>

          {/* Botões de Ação */}
          <View style={styles.actions}>
            {sale.customerPhone && (
              <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppReceipt}>
                <MaterialIcons name="chat" size={20} color="white" />
                <Text style={styles.whatsappText}>Enviar Comprovante</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeActionButton} onPress={onClose}>
              <Text style={styles.closeActionText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  backdrop: {
    flex: 1
  },
  modal: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    maxHeight: '90%',
    ...theme.shadows.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text
  },
  closeButton: {
    padding: theme.spacing(0.5)
  },
  content: {
    padding: theme.spacing(3)
  },
  section: {
    marginBottom: theme.spacing(3)
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(2)
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing(1)
  },
  label: {
    fontSize: 14,
    color: theme.colors.muted
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text
  },
  productQuantity: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: theme.spacing(0.5)
  },
  productValues: {
    alignItems: 'flex-end'
  },
  productPrice: {
    fontSize: 14,
    color: theme.colors.muted
  },
  productTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: theme.spacing(0.5)
  },
  installmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  installmentInfo: {
    flex: 1
  },
  installmentNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text
  },
  installmentDate: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: theme.spacing(0.5)
  },
  installmentPaid: {
    fontSize: 12,
    color: theme.colors.success,
    marginTop: theme.spacing(0.5)
  },
  installmentValues: {
    alignItems: 'flex-end'
  },
  installmentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text
  },
  statusBadge: {
    paddingHorizontal: theme.spacing(1),
    paddingVertical: theme.spacing(0.5),
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing(0.5)
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white'
  },
  actions: {
    flexDirection: 'row',
    padding: theme.spacing(3),
    gap: theme.spacing(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.md,
    gap: theme.spacing(1)
  },
  whatsappText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16
  },
  closeActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  closeActionText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 16
  }
});




