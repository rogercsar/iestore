import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@theme';
import { Product } from '@types';
import { formatCurrencyBRL } from '@utils/format';

type Props = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onShare: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onClose: () => void;
};

export default function ProductContextMenu({ 
  product, 
  onEdit, 
  onDelete, 
  onShare, 
  onViewDetails, 
  onClose 
}: Props) {
  const handleDelete = () => {
    Alert.alert(
      'Excluir Produto',
      `Tem certeza que deseja excluir "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            onDelete(product);
            onClose();
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: 'visibility' as keyof typeof MaterialIcons.glyphMap,
      label: 'Ver Detalhes',
      color: theme.colors.primary,
      onPress: () => {
        onViewDetails(product);
        onClose();
      }
    },
    {
      icon: 'edit' as keyof typeof MaterialIcons.glyphMap,
      label: 'Editar',
      color: theme.colors.warning,
      onPress: () => {
        onEdit(product);
        onClose();
      }
    },
    {
      icon: 'share' as keyof typeof MaterialIcons.glyphMap,
      label: 'Compartilhar',
      color: theme.colors.success,
      onPress: () => {
        onShare(product);
        onClose();
      }
    },
    {
      icon: 'delete' as keyof typeof MaterialIcons.glyphMap,
      label: 'Excluir',
      color: theme.colors.danger,
      onPress: handleDelete
    }
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{product.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.productInfo}>
            <Text style={styles.price}>{formatCurrencyBRL(product.unitPrice)}</Text>
            <Text style={styles.stock}>{product.quantity} em estoque</Text>
          </View>

          <View style={styles.menuItems}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <MaterialIcons name={item.icon} size={20} color={item.color} />
                <Text style={[styles.menuLabel, { color: item.color }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  menu: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
    width: 200,
    ...theme.shadows.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5)
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1
  },
  closeButton: {
    padding: theme.spacing(0.5)
  },
  productInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2)
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing(0.5)
  },
  stock: {
    fontSize: 12,
    color: theme.colors.muted
  },
  menuItems: {
    gap: theme.spacing(0.5)
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing(1.5)
  }
});



