import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import theme from '@theme';
import { Product } from '@types';
import { formatCurrencyBRL } from '@utils/format';
import { generatePublicProductUrl } from '@utils/publicRoutes';
import Card from '@components/Card';

type Props = {
  route: {
    params: {
      product: Product;
    };
  };
};

export default function ProductDetailsScreen({ route }: Props) {
  const navigation = useNavigation();
  const { product } = route?.params || {};

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Produto não encontrado</Text>
      </View>
    );
  }

  const profit = product.unitPrice - product.cost;
  const profitMargin = product.cost > 0 ? (profit / product.cost) * 100 : 0;

  const handleShare = async () => {
    const publicUrl = generatePublicProductUrl(product.name);
    const message = `🛍️ *${product.name}*\n\n💰 Preço: ${formatCurrencyBRL(product.unitPrice)}\n📦 Estoque: ${product.quantity} unidades\n\n🔗 Ver detalhes: ${publicUrl}`;
    
    try {
      await Share.share({
        message,
        title: product.name,
        url: publicUrl
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Produto</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <MaterialIcons name="share-social" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <Card shadow="lg" style={styles.productCard}>
        {product.photo && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: product.photo }} style={styles.productPhoto} />
          </View>
        )}
        
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={[styles.stockBadge, { 
            backgroundColor: product.quantity > 10 ? theme.colors.success : 
                           product.quantity > 5 ? theme.colors.warning : theme.colors.danger 
          }]}>
            <Text style={styles.stockText}>{product.quantity} em estoque</Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Preço de Venda</Text>
          <Text style={styles.priceValue}>{formatCurrencyBRL(product.unitPrice)}</Text>
        </View>
      </Card>

      <Card shadow="sm" style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informações Financeiras</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Custo Unitário:</Text>
          <Text style={styles.infoValue}>{formatCurrencyBRL(product.cost)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Preço de Venda:</Text>
          <Text style={styles.infoValue}>{formatCurrencyBRL(product.unitPrice)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Lucro por Unidade:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.success }]}>
            {formatCurrencyBRL(profit)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Margem de Lucro:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.success }]}>
            {profitMargin.toFixed(1)}%
          </Text>
        </View>
      </Card>

      <Card shadow="sm" style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informações de Estoque</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Quantidade Atual:</Text>
          <Text style={styles.infoValue}>{product.quantity} unidades</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Valor Total em Estoque:</Text>
          <Text style={styles.infoValue}>
            {formatCurrencyBRL(product.quantity * product.cost)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Valor de Venda Total:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
            {formatCurrencyBRL(product.quantity * product.unitPrice)}
          </Text>
        </View>
      </Card>

      <Card shadow="sm" style={styles.shareCard}>
        <View style={styles.shareHeader}>
          <MaterialIcons name="share-social" size={24} color={theme.colors.primary} />
          <Text style={styles.shareTitle}>Compartilhar Produto</Text>
        </View>
        <Text style={styles.shareDescription}>
          Compartilhe este produto com seus clientes através do WhatsApp
        </Text>
        <TouchableOpacity style={styles.shareButtonLarge} onPress={handleShare}>
          <MaterialIcons name="logo-whatsapp" size={24} color="white" />
          <Text style={styles.shareButtonText}>Compartilhar no WhatsApp</Text>
        </TouchableOpacity>
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
  shareButton: {
    padding: theme.spacing(1)
  },
  productCard: {
    margin: theme.spacing(2)
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  productPhoto: {
    width: 200,
    height: 200,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2)
  },
  productName: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing(2)
  },
  stockBadge: {
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.md
  },
  stockText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  priceSection: {
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md
  },
  priceLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing(1)
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.primary
  },
  infoCard: {
    margin: theme.spacing(2),
    marginTop: 0
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
    paddingVertical: theme.spacing(1),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    flex: 1
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text
  },
  shareCard: {
    margin: theme.spacing(2),
    marginTop: 0
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: theme.spacing(1)
  },
  shareDescription: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing(2)
  },
  shareButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.md,
    gap: theme.spacing(1)
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});



