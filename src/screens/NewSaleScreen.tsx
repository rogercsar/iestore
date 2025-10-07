import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@theme';
import { LocalData } from '@api/local';
import { Product, SaleItem, Customer } from '@types';
import { formatCurrencyBRL } from '@utils/format';
import Card from '@components/Card';
import ModernSelect from '@components/ModernSelect';
import Toast from '@components/Toast';
import { useToast } from '../hooks/useToast';

export default function NewSaleScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [isMultiSale, setIsMultiSale] = useState(false);
  const [installments, setInstallments] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const { toast, hideToast, showSuccess, showError } = useToast();

  useEffect(() => {
    LocalData.listProducts().then(setProducts).catch(console.error);
    LocalData.listCustomers().then(setCustomers).catch(console.error);
  }, []);

  const product = useMemo(() => products.find((p) => p.name === selected) ?? null, [products, selected]);
  const total = useMemo(() => {
    if (isMultiSale) {
      return saleItems.reduce((sum, item) => sum + item.totalValue, 0);
    }
    const q = Number(quantity) || 0;
    return product ? product.unitPrice * q : 0;
  }, [product, quantity, saleItems, isMultiSale]);

  const addItemToSale = () => {
    if (!product || !quantity) return;
    const q = Number(quantity);
    if (q <= 0) return;
    
    const existingIndex = saleItems.findIndex(item => item.product === product.name);
    if (existingIndex >= 0) {
      const updated = [...saleItems];
      updated[existingIndex].quantity += q;
      updated[existingIndex].totalValue = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      updated[existingIndex].totalCost = updated[existingIndex].quantity * product.cost;
      updated[existingIndex].profit = updated[existingIndex].totalValue - updated[existingIndex].totalCost;
      setSaleItems(updated);
    } else {
      const newItem: SaleItem = {
        product: product.name,
        quantity: q,
        unitPrice: product.unitPrice,
        totalValue: product.unitPrice * q,
        totalCost: product.cost * q,
        profit: (product.unitPrice - product.cost) * q
      };
      setSaleItems([...saleItems, newItem]);
    }
    
    setSelected('');
    setQuantity('1');
  };

  const removeItemFromSale = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === '') {
      setCustomerName('');
      setCustomerPhone('');
      return;
    }

    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      setCustomerName(selectedCustomer.name);
      setCustomerPhone(selectedCustomer.phone);
    }
  };

  const generateInstallments = (totalValue: number, downPayment: number, numInstallments: number) => {
    const remainingValue = totalValue - downPayment;
    const installmentValue = remainingValue / numInstallments;
    const installments = [];
    
    for (let i = 1; i <= numInstallments; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      
      installments.push({
        id: `${Date.now()}-${i}`,
        number: i,
        value: Math.round(installmentValue * 100) / 100, // Round to 2 decimal places
        dueDate: dueDate.toISOString(),
        status: 'pending' as const
      });
    }
    
    return installments;
  };

  async function onSubmit() {
    if (isMultiSale) {
      if (saleItems.length === 0) {
        showError('Adicione pelo menos um produto');
        return;
      }
      setLoading(true);
      try {
        const saleData = { 
          dateISO: new Date().toISOString(),
          items: saleItems, 
          totalValue: total,
          totalCost: saleItems.reduce((sum, item) => sum + item.totalCost, 0),
          totalProfit: saleItems.reduce((sum, item) => sum + item.profit, 0),
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          paymentMethod: paymentMethod || undefined
        };

        // Add installments if payment method is "À Prazo"
        if (paymentMethod === 'À Prazo' && installments && downPayment) {
          const numInstallments = parseInt(installments);
          const downPaymentValue = parseFloat(downPayment);
          if (numInstallments > 0 && downPaymentValue >= 0) {
            saleData.installments = generateInstallments(total, downPaymentValue, numInstallments);
            saleData.status = downPaymentValue >= total ? 'paid' : 'partial';
          }
        } else if (paymentMethod === 'À Prazo') {
          saleData.status = 'pending';
        } else {
          saleData.status = 'paid';
        }

        await LocalData.recordMultiSale(saleData);
        showSuccess('Venda registrada com sucesso!');
        setSaleItems([]);
        setCustomerName('');
        setCustomerPhone('');
        setPaymentMethod('');
      } catch (e: any) {
        showError(e?.message ?? 'Falha ao registrar venda');
      } finally {
        setLoading(false);
      }
    } else {
      if (!product) {
        showError('Selecione um produto');
        return;
      }
      const q = Number(quantity);
      if (!Number.isFinite(q) || q <= 0) {
        showError('Quantidade inválida');
        return;
      }
      if (q > product.quantity) {
        showError('Estoque insuficiente');
        return;
      }
      setLoading(true);
      try {
        const saleData = { 
          dateISO: new Date().toISOString(),
          product: product.name, 
          quantity: q,
          totalValue: product.unitPrice * q,
          totalCost: product.cost * q,
          profit: (product.unitPrice - product.cost) * q,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          paymentMethod: paymentMethod || undefined
        };

        // Add installments if payment method is "À Prazo"
        if (paymentMethod === 'À Prazo' && installments && downPayment) {
          const numInstallments = parseInt(installments);
          const downPaymentValue = parseFloat(downPayment);
          if (numInstallments > 0 && downPaymentValue >= 0) {
            saleData.installments = generateInstallments(total, downPaymentValue, numInstallments);
            saleData.status = downPaymentValue >= total ? 'paid' : 'partial';
          }
        } else if (paymentMethod === 'À Prazo') {
          saleData.status = 'pending';
        } else {
          saleData.status = 'paid';
        }

        await LocalData.recordSale(saleData);
        showSuccess('Venda registrada com sucesso!');
        setQuantity('1');
        setCustomerName('');
        setCustomerPhone('');
        setPaymentMethod('');
      } catch (e: any) {
        showError(e?.message ?? 'Falha ao registrar venda');
      } finally {
        setLoading(false);
      }
    }
    setSelected('');
    setIsMultiSale(false);
    setInstallments('');
    setDownPayment('');
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card shadow="lg">
        <View style={styles.header}>
          <Text style={styles.title}>Registrar Nova Venda</Text>
          <TouchableOpacity 
            onPress={() => setIsMultiSale(!isMultiSale)}
            style={[styles.toggleButton, { backgroundColor: isMultiSale ? theme.colors.primary : theme.colors.surface }]}
          >
            <MaterialIcons 
              name={isMultiSale ? "list" : "add"} 
              size={20} 
              color={isMultiSale ? 'white' : theme.colors.primary} 
            />
            <Text style={[styles.toggleText, { color: isMultiSale ? 'white' : theme.colors.primary }]}>
              {isMultiSale ? 'Múltiplos' : 'Único'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Cliente</Text>
          <View style={styles.formGroup}>
            <ModernSelect
              label="Cliente"
              options={[
                { label: "Selecionar cliente...", value: "" },
                ...customers.map(customer => ({
                  label: customer.name,
                  value: customer.id
                }))
              ]}
              selectedValue={customers.find(c => c.name === customerName)?.id || ''}
              onValueChange={handleCustomerSelect}
              placeholder="Selecione um cliente (opcional)"
            />
          </View>
          
          {customerName && (
            <View style={styles.customerInfo}>
              <View style={styles.customerInfoRow}>
                <Text style={styles.customerInfoLabel}>Nome:</Text>
                <Text style={styles.customerInfoValue}>{customerName}</Text>
              </View>
              <View style={styles.customerInfoRow}>
                <Text style={styles.customerInfoLabel}>Telefone:</Text>
                <Text style={styles.customerInfoValue}>{customerPhone}</Text>
              </View>
            </View>
          )}
          <View style={styles.formGroup}>
            <ModernSelect
              label="Forma de Pagamento"
              options={[
                { label: "Dinheiro", value: "Dinheiro" },
                { label: "PIX", value: "PIX" },
                { label: "Cartão de Débito", value: "Cartão de Débito" },
                { label: "Cartão de Crédito", value: "Cartão de Crédito" },
                { label: "Transferência", value: "Transferência" },
                { label: "À Prazo (Parcelado)", value: "À Prazo" }
              ]}
              selectedValue={paymentMethod}
              onValueChange={setPaymentMethod}
              placeholder="Selecione a forma de pagamento..."
            />
          </View>

          {paymentMethod === 'À Prazo' && (
            <View style={styles.installmentSection}>
              <Text style={styles.sectionTitle}>Configuração de Parcelas</Text>
              
              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Entrada (R$)</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={downPayment}
                    onChangeText={setDownPayment}
                    style={styles.input}
                    placeholder="0,00"
                    placeholderTextColor={theme.colors.muted}
                  />
                </View>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Número de Parcelas</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={installments}
                    onChangeText={setInstallments}
                    style={styles.input}
                    placeholder="1"
                    placeholderTextColor={theme.colors.muted}
                  />
                </View>
              </View>

              {installments && downPayment && (
                <View style={styles.installmentPreview}>
                  <Text style={styles.previewTitle}>Resumo das Parcelas:</Text>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Entrada:</Text>
                    <Text style={styles.previewValue}>{formatCurrencyBRL(parseFloat(downPayment) || 0)}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Valor Restante:</Text>
                    <Text style={styles.previewValue}>
                      {formatCurrencyBRL(total - (parseFloat(downPayment) || 0))}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Valor por Parcela:</Text>
                    <Text style={styles.previewValue}>
                      {formatCurrencyBRL((total - (parseFloat(downPayment) || 0)) / (parseInt(installments) || 1))}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Product Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos</Text>
          <View style={styles.formGroup}>
            <ModernSelect
              label="Selecione o Produto"
              options={products.map(p => ({
                label: `${p.name} (${p.quantity} em estoque)`,
                value: p.name
              }))}
              selectedValue={selected}
              onValueChange={setSelected}
              placeholder="Selecione um produto..."
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Quantidade</Text>
            <TextInput
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              style={styles.input}
              placeholder="Digite a quantidade"
              placeholderTextColor={theme.colors.muted}
            />
          </View>

          {isMultiSale && (
            <TouchableOpacity onPress={addItemToSale} style={styles.addButton}>
              <MaterialIcons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Adicionar Produto</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sale Items List */}
        {isMultiSale && saleItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Itens da Venda</Text>
            {saleItems.map((item, index) => (
              <Card key={index} shadow="sm" style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.product}</Text>
                  <TouchableOpacity onPress={() => removeItemFromSale(index)} style={styles.removeButton}>
                    <MaterialIcons name="close" size={20} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemDetail}>Qtd: {item.quantity}</Text>
                  <Text style={styles.itemDetail}>Unit: {formatCurrencyBRL(item.unitPrice)}</Text>
                  <Text style={styles.itemDetail}>Total: {formatCurrencyBRL(item.totalValue)}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Summary */}
        {(product || saleItems.length > 0) && (
          <Card shadow="sm" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo da Venda</Text>
            {!isMultiSale && product && (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Produto:</Text>
                  <Text style={styles.summaryValue}>{product.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Preço unitário:</Text>
                  <Text style={styles.summaryValue}>{formatCurrencyBRL(product.unitPrice)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Quantidade:</Text>
                  <Text style={styles.summaryValue}>{quantity}</Text>
                </View>
              </>
            )}
            {isMultiSale && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Itens:</Text>
                <Text style={styles.summaryValue}>{saleItems.length}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatCurrencyBRL(total)}</Text>
            </View>
          </Card>
        )}

        <Pressable 
          disabled={loading || (!product && saleItems.length === 0)} 
          onPress={onSubmit} 
          style={({ pressed }) => [
            styles.button, 
            pressed && { opacity: 0.8 }, 
            (loading || (!product && saleItems.length === 0)) && { opacity: 0.6 }
          ]}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Registrando...' : 'Registrar Venda'}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    flex: 1
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.md,
    gap: theme.spacing(1)
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600'
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
  formGroup: {
    marginBottom: theme.spacing(2)
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
  pickerContainer: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    overflow: 'hidden'
  },
  picker: {
    color: theme.colors.text,
    backgroundColor: 'transparent'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing(1.5),
    borderRadius: theme.radius.md,
    gap: theme.spacing(1)
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  },
  itemCard: {
    marginBottom: theme.spacing(1)
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1
  },
  removeButton: {
    padding: theme.spacing(0.5)
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing(2)
  },
  itemDetail: {
    fontSize: 14,
    color: theme.colors.muted,
    fontWeight: '500'
  },
  summaryCard: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(2)
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '500'
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing(1),
    marginTop: theme.spacing(1)
  },
  totalLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  totalValue: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '800'
  },
  button: {
    marginTop: theme.spacing(3),
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
  installmentSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  installmentPreview: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(1)
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing(0.5)
  },
  previewLabel: {
    fontSize: 14,
    color: theme.colors.muted
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text
  },
  customerInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing(0.5)
  },
  customerInfoLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    fontWeight: '500'
  },
  customerInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text
  }
});