import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '@theme';
import { LocalData } from '@api/local';
import { Sale, MultiSale, Installment } from '@types';
import { formatCurrencyBRL, formatDateBR } from '@utils/format';
import Card from '@components/Card';
import Toast from '@components/Toast';
import { useToast } from '../hooks/useToast';

type PendingPayment = {
  saleId: string;
  sale: Sale | MultiSale;
  installment: Installment;
  customerName?: string;
  customerPhone?: string;
};

type CalendarDay = {
  date: Date;
  payments: PendingPayment[];
  totalAmount: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export default function PendingPaymentsScreen() {
  const navigation = useNavigation();
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast, hideToast, showSuccess, showError } = useToast();

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      const sales = await LocalData.salesHistory();
      const pending: PendingPayment[] = [];

      sales.forEach((sale, index) => {
        if (sale.installments && sale.installments.length > 0) {
          sale.installments.forEach(installment => {
            if (installment.status === 'pending' || installment.status === 'overdue') {
              pending.push({
                saleId: `${index}`,
                sale,
                installment,
                customerName: sale.customerName,
                customerPhone: sale.customerPhone
              });
            }
          });
        }
      });

      setPendingPayments(pending);
    } catch (error) {
      console.error('Erro ao carregar pagamentos pendentes:', error);
      showError('Erro ao carregar pagamentos pendentes');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPendingPayments();
    } finally {
      setRefreshing(false);
    }
  };

  const markAsPaid = async (payment: PendingPayment) => {
    try {
      const sales = await LocalData.salesHistory();
      const saleIndex = parseInt(payment.saleId);
      
      if (saleIndex >= 0 && saleIndex < sales.length) {
        const sale = sales[saleIndex];
        if (sale.installments) {
          const installmentIndex = sale.installments.findIndex(
            inst => inst.id === payment.installment.id
          );
          
          if (installmentIndex >= 0) {
            sale.installments[installmentIndex].status = 'paid';
            sale.installments[installmentIndex].paidDate = new Date().toISOString();
            
            // Update sale status
            const allPaid = sale.installments.every(inst => inst.status === 'paid');
            sale.status = allPaid ? 'paid' : 'partial';
            
            // Save updated sales
            await LocalData.seedSalesIfEmpty(sales);
            
            showSuccess('Parcela marcada como paga!');
            await loadPendingPayments();
            
            // Update selected day if modal is open
            if (selectedDay) {
              const updatedDay = { ...selectedDay };
              updatedDay.payments = updatedDay.payments.filter(p => p.installment.id !== payment.installment.id);
              updatedDay.totalAmount = updatedDay.payments.reduce((sum, p) => sum + p.installment.value, 0);
              setSelectedDay(updatedDay);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao marcar parcela como paga:', error);
      showError('Erro ao marcar parcela como paga');
    }
  };

  const generateCalendar = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayPayments = pendingPayments.filter(payment => {
        const dueDate = new Date(payment.installment.dueDate);
        return dueDate.toDateString() === date.toDateString();
      });
      
      const totalAmount = dayPayments.reduce((sum, payment) => sum + payment.installment.value, 0);
      
      days.push({
        date,
        payments: dayPayments,
        totalAmount,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDayPress = (day: CalendarDay) => {
    if (day.payments.length > 0) {
      setSelectedDay(day);
      setModalVisible(true);
    }
  };

  const getStatusColor = (installment: Installment) => {
    const dueDate = new Date(installment.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (installment.status === 'paid') return theme.colors.success;
    if (installment.status === 'overdue' || diffDays < 0) return theme.colors.danger;
    if (diffDays <= 3) return theme.colors.warning;
    return theme.colors.muted;
  };

  const getStatusText = (installment: Installment) => {
    const dueDate = new Date(installment.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (installment.status === 'paid') return 'Pago';
    if (installment.status === 'overdue' || diffDays < 0) return 'Vencido';
    if (diffDays === 0) return 'Vence hoje';
    if (diffDays === 1) return 'Vence amanhã';
    return `${diffDays} dias`;
  };

  const calendarDays = generateCalendar();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Valores a Receber</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            tintColor={theme.colors.primary}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* Calendar Header */}
        <Card shadow="sm" style={styles.calendarHeader}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <MaterialIcons name="chevron-left" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Calendar Grid */}
        <Card shadow="sm" style={styles.calendar}>
          {/* Week days header */}
          <View style={styles.weekDaysHeader}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <Text key={day} style={styles.weekDay}>{day}</Text>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.dayCellOtherMonth,
                  day.isToday && styles.dayCellToday,
                  day.payments.length > 0 && styles.dayCellWithPayments
                ]}
                onPress={() => handleDayPress(day)}
                disabled={day.payments.length === 0}
              >
                <Text style={[
                  styles.dayNumber,
                  !day.isCurrentMonth && styles.dayNumberOtherMonth,
                  day.isToday && styles.dayNumberToday
                ]}>
                  {day.date.getDate()}
                </Text>
                {day.payments.length > 0 && (
                  <View style={styles.dayPayments}>
                    <Text style={styles.dayPaymentCount}>{day.payments.length}</Text>
                    <Text style={styles.dayPaymentAmount}>
                      {formatCurrencyBRL(day.totalAmount)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Summary */}
        <Card shadow="sm" style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumo do Mês</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total a Receber:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrencyBRL(pendingPayments.reduce((sum, p) => sum + p.installment.value, 0))}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Parcelas Pendentes:</Text>
            <Text style={styles.summaryValue}>{pendingPayments.length}</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Day Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDay && formatDateBR(selectedDay.date.toISOString())}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedDay?.payments.map((payment, index) => (
                <Card key={index} shadow="sm" style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentCustomer}>
                        {payment.customerName || 'Cliente não informado'}
                      </Text>
                      <Text style={styles.paymentPhone}>
                        {payment.customerPhone || 'Telefone não informado'}
                      </Text>
                      <Text style={styles.paymentValue}>
                        {formatCurrencyBRL(payment.installment.value)}
                      </Text>
                    </View>
                    <View style={styles.paymentActions}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(payment.installment) }
                      ]}>
                        <Text style={styles.statusText}>
                          {getStatusText(payment.installment)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.paidButton}
                        onPress={() => markAsPaid(payment)}
                      >
                        <MaterialIcons name="checkmark" size={16} color="white" />
                        <Text style={styles.paidButtonText}>Recebido</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
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
  content: {
    flex: 1,
    padding: theme.spacing(2)
  },
  calendarHeader: {
    marginBottom: theme.spacing(2)
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2)
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text
  },
  calendar: {
    marginBottom: theme.spacing(2)
  },
  weekDaysHeader: {
    flexDirection: 'row',
    paddingVertical: theme.spacing(1),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.muted,
    paddingVertical: theme.spacing(1)
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(0.5)
  },
  dayCellOtherMonth: {
    backgroundColor: theme.colors.surface
  },
  dayCellToday: {
    backgroundColor: theme.colors.primary + '20'
  },
  dayCellWithPayments: {
    backgroundColor: theme.colors.warning + '20'
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text
  },
  dayNumberOtherMonth: {
    color: theme.colors.muted
  },
  dayNumberToday: {
    color: theme.colors.primary,
    fontWeight: '800'
  },
  dayPayments: {
    alignItems: 'center',
    marginTop: theme.spacing(0.5)
  },
  dayPaymentCount: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.warning
  },
  dayPaymentAmount: {
    fontSize: 8,
    color: theme.colors.text,
    fontWeight: '600'
  },
  summary: {
    marginBottom: theme.spacing(2)
  },
  summaryTitle: {
    fontSize: 16,
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
    fontSize: 14,
    color: theme.colors.muted
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    maxHeight: '80%'
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
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text
  },
  modalBody: {
    padding: theme.spacing(2)
  },
  paymentCard: {
    marginBottom: theme.spacing(2)
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  paymentInfo: {
    flex: 1
  },
  paymentCustomer: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5)
  },
  paymentPhone: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing(0.5)
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary
  },
  paymentActions: {
    alignItems: 'flex-end',
    gap: theme.spacing(1)
  },
  statusBadge: {
    paddingHorizontal: theme.spacing(1),
    paddingVertical: theme.spacing(0.5),
    borderRadius: theme.radius.sm
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white'
  },
  paidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.md,
    gap: theme.spacing(1)
  },
  paidButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  }
});