import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '@theme';
import { Product } from '@types';
import { formatCurrencyBRL } from '@utils/format';
import { LocalData } from '@api/local';
import Card from '@components/Card';

type Props = {
  productName: string;
};

export default function PublicProductPage({ productName }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productName]);

  const loadProduct = async () => {
    try {
      const products = await LocalData.listProducts();
      const foundProduct = products.find(p => p.name === productName);
      setProduct(foundProduct || null);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Olá! Gostaria de saber mais sobre o produto: *${product?.name}*`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl).catch(() => {
      // Fallback para web se o app não estiver instalado
      const webUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      Linking.openURL(webUrl);
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando produto...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="alert-circle" size={64} color={theme.colors.danger} />
        <Text style={styles.errorTitle}>Produto não encontrado</Text>
        <Text style={styles.errorText}>
          O produto que você está procurando não existe ou foi removido.
        </Text>
      </View>
    );
  }

  const profit = product.unitPrice - product.cost;
  const profitMargin = product.cost > 0 ? (profit / product.cost) * 100 : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="storefront" size={32} color={theme.colors.primary} />
          <Text style={styles.logoText}>inCRM Store</Text>
        </View>
      </View>

      {/* Product Card */}
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
            <Text style={styles.stockText}>
              {product.quantity > 0 ? `${product.quantity} disponíveis` : 'Esgotado'}
            </Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Preço</Text>
          <Text style={styles.priceValue}>{formatCurrencyBRL(product.unitPrice)}</Text>
          <Text style={styles.priceSubtext}>Preço final</Text>
        </View>
      </Card>

      {/* Product Info */}
      <Card shadow="sm" style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informações do Produto</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nome:</Text>
          <Text style={styles.infoValue}>{product.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Preço:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.primary, fontWeight: '700' }]}>
            {formatCurrencyBRL(product.unitPrice)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Disponibilidade:</Text>
          <Text style={[styles.infoValue, { 
            color: product.quantity > 0 ? theme.colors.success : theme.colors.danger 
          }]}>
            {product.quantity > 0 ? `${product.quantity} unidades` : 'Esgotado'}
          </Text>
        </View>
      </Card>

      {/* Contact Info */}
      <Card shadow="sm" style={styles.contactCard}>
        <View style={styles.contactHeader}>
          <MaterialIcons name="call" size={24} color={theme.colors.primary} />
          <Text style={styles.contactTitle}>Interessado no produto?</Text>
        </View>
        <Text style={styles.contactText}>
          Entre em contato conosco para mais informações ou para fazer seu pedido.
        </Text>
        <TouchableOpacity style={styles.contactButton} onPress={handleWhatsAppContact}>
          <MaterialIcons name="logo-whatsapp" size={20} color="white" />
          <Text style={styles.contactButtonText}>Entrar em Contato</Text>
        </TouchableOpacity>
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 inCRM Store - Todos os direitos reservados</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  loadingText: {
    marginTop: theme.spacing(2),
    fontSize: 16,
    color: theme.colors.muted
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing(4)
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 24
  },
  header: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2)
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primary
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
    marginBottom: theme.spacing(3)
  },
  productName: {
    fontSize: 28,
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
    padding: theme.spacing(3),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg
  },
  priceLabel: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: theme.spacing(1)
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing(0.5)
  },
  priceSubtext: {
    fontSize: 14,
    color: theme.colors.muted
  },
  infoCard: {
    margin: theme.spacing(2),
    marginTop: 0
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(2)
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  infoLabel: {
    fontSize: 16,
    color: theme.colors.muted,
    flex: 1
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text
  },
  contactCard: {
    margin: theme.spacing(2),
    marginTop: 0
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: theme.spacing(1)
  },
  contactText: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing(3),
    lineHeight: 20
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.md,
    gap: theme.spacing(1)
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    padding: theme.spacing(3),
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.muted
  }
});




