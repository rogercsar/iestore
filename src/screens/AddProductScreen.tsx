import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import theme from '@theme';
import { LocalData } from '@api/local';
import { Product } from '@types';
import Card from '@components/Card';
import Toast from '@components/Toast';
import { useToast } from '../hooks/useToast';
import ModernSelect from '@components/ModernSelect';

type Props = {
  onProductAdded: () => void;
};

const categories = [
  { label: "Eletrônicos", value: "eletronicos" },
  { label: "Roupas", value: "roupas" },
  { label: "Casa e Jardim", value: "casa" },
  { label: "Esportes", value: "esportes" },
  { label: "Beleza", value: "beleza" },
  { label: "Livros", value: "livros" },
  { label: "Automóveis", value: "automoveis" },
  { label: "Outros", value: "outros" }
];

export default function AddProductScreen({ onProductAdded }: Props) {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast, hideToast, showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    if (!name.trim() || !quantity.trim() || !cost.trim() || !unitPrice.trim()) {
      showError('Preencha todos os campos obrigatórios');
      return;
    }

    const qty = Number(quantity);
    const costValue = Number(cost);
    const priceValue = Number(unitPrice);

    if (!Number.isFinite(qty) || qty < 0) {
      showError('Quantidade inválida');
      return;
    }

    if (!Number.isFinite(costValue) || costValue < 0) {
      showError('Custo inválido');
      return;
    }

    if (!Number.isFinite(priceValue) || priceValue < 0) {
      showError('Preço de venda inválido');
      return;
    }

    setLoading(true);
    try {
      const products = await LocalData.listProducts();
      const newProduct: Product = {
        name: name.trim(),
        quantity: qty,
        cost: costValue,
        unitPrice: priceValue,
        photo: photo.trim() || undefined
      };
      
      // Check if product already exists
      const existingIndex = products.findIndex(p => p.name.toLowerCase() === name.trim().toLowerCase());
      if (existingIndex >= 0) {
        showError('Já existe um produto com este nome');
        return;
      }

      products.push(newProduct);
      await LocalData.seedProductsIfEmpty(products);
      
      showSuccess('Produto adicionado com sucesso!');
      setName('');
      setQuantity('');
      setCost('');
      setUnitPrice('');
      setCategory('');
      setDescription('');
      setPhoto('');
      onProductAdded();
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (e: any) {
      showError(e?.message ?? 'Falha ao adicionar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        // Simular upload - em produção, você faria upload para um serviço como Cloudinary, AWS S3, etc.
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPhoto(result.assets[0].uri);
        setUploading(false);
        Alert.alert('Sucesso', 'Imagem selecionada com sucesso!');
      }
    } catch (error) {
      setUploading(false);
      Alert.alert('Erro', 'Falha ao selecionar imagem');
    }
  };

  const handleCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPhoto(result.assets[0].uri);
        setUploading(false);
        Alert.alert('Sucesso', 'Foto capturada com sucesso!');
      }
    } catch (error) {
      setUploading(false);
      Alert.alert('Erro', 'Falha ao capturar foto');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Selecionar Imagem',
      'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: handleImagePicker },
        { text: 'Câmera', onPress: handleCamera }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card shadow="lg">
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <MaterialIcons name="add-circle" size={32} color={theme.colors.primary} />
            <Text style={styles.title}>Adicionar Novo Produto</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome do Produto *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Digite o nome do produto"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.formGroup}>
          <ModernSelect
            label="Categoria"
            options={categories}
            selectedValue={category}
            onValueChange={setCategory}
            placeholder="Selecione uma categoria..."
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: theme.spacing(1) }]}>
            <Text style={styles.label}>Quantidade *</Text>
            <TextInput
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              style={styles.input}
              placeholder="0"
              placeholderTextColor={theme.colors.muted}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: theme.spacing(1) }]}>
            <Text style={styles.label}>Custo (R$) *</Text>
            <TextInput
              keyboardType="numeric"
              value={cost}
              onChangeText={setCost}
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor={theme.colors.muted}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Preço de Venda (R$) *</Text>
          <TextInput
            keyboardType="numeric"
            value={unitPrice}
            onChangeText={setUnitPrice}
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Foto do Produto</Text>
          
          {photo ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: photo }} style={styles.productImage} />
              <TouchableOpacity 
                onPress={() => setPhoto('')}
                style={styles.removeImageButton}
              >
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={showImageOptions}
              style={styles.uploadButton}
              disabled={uploading}
            >
              <MaterialIcons 
                name={uploading ? "hourglass" : "camera"} 
                size={32} 
                color={uploading ? theme.colors.muted : theme.colors.primary} 
              />
              <Text style={[styles.uploadText, { color: uploading ? theme.colors.muted : theme.colors.primary }]}>
                {uploading ? 'Processando...' : 'Adicionar Foto'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            placeholder="Descrição opcional do produto"
            placeholderTextColor={theme.colors.muted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumo</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Lucro por unidade:</Text>
            <Text style={styles.summaryValue}>
              {cost && unitPrice ? 
                `R$ ${(Number(unitPrice) - Number(cost)).toFixed(2)}` : 
                'R$ 0,00'
              }
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Margem de lucro:</Text>
            <Text style={styles.summaryValue}>
              {cost && unitPrice && Number(cost) > 0 ? 
                `${(((Number(unitPrice) - Number(cost)) / Number(cost)) * 100).toFixed(1)}%` : 
                '0%'
              }
            </Text>
          </View>
        </View>

        <Pressable 
          disabled={loading} 
          onPress={handleSubmit} 
          style={({ pressed }) => [
            styles.button, 
            pressed && { opacity: 0.8 }, 
            loading && { opacity: 0.6 }
          ]}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Adicionando...' : 'Adicionar Produto'}
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
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  backButton: {
    padding: theme.spacing(1),
    marginRight: theme.spacing(2)
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing(2)
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text
  },
  formGroup: {
    marginBottom: theme.spacing(3)
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing(2)
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
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  summary: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(1)
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5)
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 14
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  button: {
    marginTop: theme.spacing(2),
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
  imageContainer: {
    position: 'relative',
    alignItems: 'center'
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radius.lg,
    padding: theme.spacing(4),
    alignItems: 'center',
    backgroundColor: theme.colors.surface
  },
  uploadText: {
    marginTop: theme.spacing(1),
    fontSize: 16,
    fontWeight: '600'
  }
});
