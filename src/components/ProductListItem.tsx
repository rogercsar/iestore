import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@theme';
import { Product } from '@types';
import { formatCurrencyBRL } from '@utils/format';
import Card from './Card';
import ProductContextMenu from './ProductContextMenu';

type Props = { 
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onShare?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
};

export default function ProductListItem({ 
  product, 
  onEdit, 
  onDelete, 
  onShare, 
  onViewDetails 
}: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const totalCost = product.cost;
  const unitPrice = product.unitPrice;
  const profit = unitPrice - totalCost;
  const profitMargin = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  
  return (
    <>
      <Card padding={theme.spacing(2)} shadow="sm">
        <View style={styles.container}>
          {product.photo && (
            <View style={styles.photoContainer}>
              <Image source={{ uri: product.photo }} style={styles.productPhoto} />
            </View>
          )}
          
          <View style={styles.header}>
            <Text style={styles.name}>{product.name}</Text>
            <View style={styles.headerRight}>
              <View style={[styles.badge, { backgroundColor: product.quantity > 0 ? theme.colors.success : theme.colors.danger }]}>
                <Text style={[styles.badgeText, { color: 'white' }]}>
                  {product.quantity} em estoque
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowMenu(true)}
                style={styles.menuButton}
              >
                <MaterialIcons name="more-vert" size={20} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.details}>
            <View style={styles.row}>
              <Text style={styles.label}>Custo:</Text>
              <Text style={styles.value}>{formatCurrencyBRL(totalCost)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Venda:</Text>
              <Text style={[styles.value, { color: theme.colors.primary }]}>{formatCurrencyBRL(unitPrice)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Lucro:</Text>
              <Text style={[styles.value, { color: theme.colors.success }]}>
                {formatCurrencyBRL(profit)} ({profitMargin.toFixed(1)}%)
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {showMenu && (
        <ProductContextMenu
          product={product}
          onEdit={onEdit || (() => {})}
          onDelete={onDelete || (() => {})}
          onShare={onShare || (() => {})}
          onViewDetails={onViewDetails || (() => {})}
          onClose={() => setShowMenu(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing(1)
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  productPhoto: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  name: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: theme.spacing(1)
  },
  menuButton: {
    padding: theme.spacing(0.5)
  },
  badge: {
    paddingHorizontal: theme.spacing(1),
    paddingVertical: theme.spacing(0.5),
    borderRadius: theme.radius.sm
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  details: {
    gap: theme.spacing(0.5)
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '500'
  },
  value: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600'
  }
});


