import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { LocalData } from '@api/local';
import { Sale, MultiSale, Installment } from '@types';
import { formatCurrencyBRL, formatDateBR } from '@utils/format';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async schedulePaymentReminders(): Promise<void> {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      const sales = await LocalData.salesHistory();
      const today = new Date();
      
      for (const sale of sales) {
        if (sale.installments && sale.installments.length > 0) {
          for (const installment of sale.installments) {
            if (installment.status === 'pending' || installment.status === 'overdue') {
              const dueDate = new Date(installment.dueDate);
              const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              // Schedule notifications for:
              // - 7 days before due date
              // - 3 days before due date
              // - 1 day before due date
              // - On due date
              // - 1 day after due date (overdue)
              
              const notificationDays = [7, 3, 1, 0, -1];
              
              for (const days of notificationDays) {
                const notificationDate = new Date(dueDate);
                notificationDate.setDate(notificationDate.getDate() - days);
                
                // Only schedule if the date is in the future
                if (notificationDate > today) {
                  await this.schedulePaymentNotification(
                    sale,
                    installment,
                    notificationDate,
                    days
                  );
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling payment reminders:', error);
    }
  }

  private static async schedulePaymentNotification(
    sale: Sale | MultiSale,
    installment: Installment,
    notificationDate: Date,
    daysUntilDue: number
  ): Promise<void> {
    try {
      const customerName = sale.customerName || 'Cliente não informado';
      const productName = 'items' in sale ? 
        sale.items.map(item => item.product).join(', ') : 
        sale.product;
      
      let title = '';
      let body = '';
      
      if (daysUntilDue > 0) {
        title = `💳 Pagamento Próximo`;
        body = `${customerName} - Parcela ${installment.number} de ${formatCurrencyBRL(installment.value)} vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''}`;
      } else if (daysUntilDue === 0) {
        title = `⏰ Pagamento Vence Hoje`;
        body = `${customerName} - Parcela ${installment.number} de ${formatCurrencyBRL(installment.value)} vence hoje!`;
      } else {
        title = `🚨 Pagamento Atrasado`;
        body = `${customerName} - Parcela ${installment.number} de ${formatCurrencyBRL(installment.value)} está atrasada há ${Math.abs(daysUntilDue)} dia${Math.abs(daysUntilDue) > 1 ? 's' : ''}`;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            saleId: sale.dateISO,
            installmentId: installment.id,
            customerName,
            amount: installment.value,
            dueDate: installment.dueDate,
            type: 'payment_reminder'
          },
          sound: true,
          priority: daysUntilDue <= 0 ? Notifications.AndroidNotificationPriority.HIGH : Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          date: notificationDate,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  static async checkUpcomingPayments(): Promise<{
    upcoming: Array<{sale: Sale | MultiSale, installment: Installment, daysUntilDue: number}>;
    overdue: Array<{sale: Sale | MultiSale, installment: Installment, daysOverdue: number}>;
  }> {
    try {
      const sales = await LocalData.salesHistory();
      const today = new Date();
      const upcoming: Array<{sale: Sale | MultiSale, installment: Installment, daysUntilDue: number}> = [];
      const overdue: Array<{sale: Sale | MultiSale, installment: Installment, daysOverdue: number}> = [];
      
      for (const sale of sales) {
        if (sale.installments && sale.installments.length > 0) {
          for (const installment of sale.installments) {
            if (installment.status === 'pending') {
              const dueDate = new Date(installment.dueDate);
              const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysUntilDue >= 0 && daysUntilDue <= 7) {
                upcoming.push({ sale, installment, daysUntilDue });
              } else if (daysUntilDue < 0) {
                overdue.push({ sale, installment, daysOverdue: Math.abs(daysUntilDue) });
              }
            }
          }
        }
      }
      
      return { upcoming, overdue };
    } catch (error) {
      console.error('Error checking upcoming payments:', error);
      return { upcoming: [], overdue: [] };
    }
  }

  static async sendImmediateNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  static async getNotificationCount(): Promise<number> {
    try {
      const { upcoming, overdue } = await this.checkUpcomingPayments();
      return upcoming.length + overdue.length;
    } catch (error) {
      console.error('Error getting notification count:', error);
      return 0;
    }
  }
}




