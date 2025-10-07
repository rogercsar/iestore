import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import PublicProductPage from './screens/PublicProductPage';
import { LocalData } from './api/local';
import seed from '../assets/products.seed.json';

export default function PublicApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed products if empty
    LocalData.seedProductsIfEmpty(seed as any[]).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Get product name from URL hash or query params
  const getProductNameFromUrl = (): string | null => {
    if (typeof window !== 'undefined') {
      // Try query params first (new format)
      const urlParams = new URLSearchParams(window.location.search);
      const productName = urlParams.get('product');
      if (productName) {
        return decodeURIComponent(productName);
      }

      // Try hash (old format for backward compatibility)
      const hash = window.location.hash;
      const hashMatch = hash.match(/#\/public-product\/(.+)/);
      if (hashMatch) {
        return decodeURIComponent(hashMatch[1]);
      }

      // Try pathname
      const pathMatch = window.location.pathname.match(/\/public-product\/(.+)/);
      if (pathMatch) {
        return decodeURIComponent(pathMatch[1]);
      }
    }
    return null;
  };

  const productName = getProductNameFromUrl();

  if (!productName) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Produto não especificado</Text>
        <Text style={styles.errorText}>
          Acesse através de um link válido de produto.
        </Text>
      </View>
    );
  }

  return <PublicProductPage productName={productName} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 32
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center'
  }
});
