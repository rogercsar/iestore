import React, { useState, useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardScreen from './src/screens/DashboardScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import NewSaleScreen from './src/screens/NewSaleScreen';
import SalesHistoryScreen from './src/screens/SalesHistoryScreen';
import LoginScreen from './src/screens/LoginScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import PublicProductScreen from './src/screens/PublicProductScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import UsersScreen from './src/screens/UsersScreen';
import CustomersScreen from './src/screens/CustomersScreen';
import AddCustomerScreen from './src/screens/AddCustomerScreen';
import PendingPaymentsScreen from './src/screens/PendingPaymentsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PublicApp from './src/PublicApp';
import CustomTabBar from './src/components/CustomTabBar';
import { LocalData } from './src/api/local';
import seed from './assets/products.seed.json';
import theme from './src/theme';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.card,
    text: theme.colors.text,
    primary: theme.colors.primary,
    border: theme.colors.border
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    // seed products on first run
    LocalData.seedProductsIfEmpty(seed as any);
    // additionally attempt to seed all datasets from /data when running under web hosting
    LocalData.seedAllIfEmpty().catch(() => {});
    // try pulling from Google Sheets if available
    LocalData.syncFromSheets().catch(() => {});
    // Inject web font-face fallbacks for Material icons to avoid 404 from @expo path
    if (Platform.OS === 'web') {
      try {
        // Remove any existing font styles
        const existingStyles = document.querySelectorAll('[data-iestore-fonts]');
        existingStyles.forEach(style => style.remove());
        
        const style = document.createElement('style');
        style.setAttribute('data-iestore-fonts', 'true');
        style.innerHTML = `
@font-face { 
  font-family: 'Material Icons'; 
  src: url('/assets/fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf') format('truetype'); 
  font-weight: normal; 
  font-style: normal; 
  font-display: swap; 
}
@font-face { 
  font-family: 'MaterialIcons'; 
  src: url('/assets/fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf') format('truetype'); 
  font-weight: normal; 
  font-style: normal; 
  font-display: swap; 
}
@font-face { 
  font-family: 'Material Design Icons'; 
  src: url('/assets/fonts/MaterialCommunityIcons.b62641afc9ab487008e996a5c5865e56.ttf') format('truetype'); 
  font-weight: normal; 
  font-style: normal; 
  font-display: swap; 
}
.material-icons {
  font-family: 'Material Icons', 'MaterialIcons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
/* Force icon rendering for React Native Web */
[class*="MaterialIcons"] {
  font-family: 'Material Icons', 'MaterialIcons' !important;
}
/* Override Expo's font loading */
@font-face { 
  font-family: 'MaterialIcons'; 
  src: url('/assets/fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf') format('truetype') !important; 
  font-weight: normal !important; 
  font-style: normal !important; 
  font-display: swap !important; 
}
`;
        document.head.appendChild(style);

        // Intercept font loading requests and redirect them
        const originalFetch = window.fetch;
        window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
          const url = typeof input === 'string' ? input : input.toString();
          
          // Redirect MaterialIcons font requests to our mirrored path
          if (url.includes('MaterialIcons') && url.includes('.ttf')) {
            const redirectedUrl = '/assets/fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf';
            console.log('Redirecting font request from', url, 'to', redirectedUrl);
            return originalFetch(redirectedUrl, init);
          }
          
          // Redirect MaterialCommunityIcons font requests
          if (url.includes('MaterialCommunityIcons') && url.includes('.ttf')) {
            const redirectedUrl = '/assets/fonts/MaterialCommunityIcons.b62641afc9ab487008e996a5c5865e56.ttf';
            console.log('Redirecting font request from', url, 'to', redirectedUrl);
            return originalFetch(redirectedUrl, init);
          }
          
          return originalFetch(input, init);
        };
      } catch {}
    }
    // migrate existing sales data
    LocalData.migrateSalesData();
    // recalculate customer stats to fix any missing data
    LocalData.recalculateCustomerStats();
  }, []);

  // Ensure MaterialIcons font is available
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Always try to load MaterialIcons font
        await Font.loadAsync(MaterialIcons.font);
        if (mounted) setFontsReady(true);
      } catch (e) {
        console.warn('Font loading failed, continuing anyway:', e);
        // Try alternative loading methods
        try { 
          await (MaterialIcons.loadFont?.() as unknown as Promise<void>); 
        } catch {}
        if (mounted) setFontsReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if this is a public product page
      if (typeof window !== 'undefined') {
        const isPublicPage = window.location.hash.includes('public-product') ||
                            window.location.pathname.includes('public-product') ||
                            window.location.search.includes('product=');

        if (isPublicPage) {
          setIsAuthenticated(true); // Skip login for public pages
          setIsLoading(false);
          return;
        }
      }

      // Check if user is already authenticated
      const authToken = await AsyncStorage.getItem('authToken');
      if (authToken) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (token: string) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  };

  // Show loading screen while checking auth status or loading fonts
  if (isLoading || !fontsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ fontSize: 18, color: theme.colors.text }}>Carregando...</Text>
      </View>
    );
  }

  // Check if this is a public product page
  if (typeof window !== 'undefined') {
    const isPublicPage = window.location.hash.includes('public-product') || 
                        window.location.pathname.includes('public-product') ||
                        window.location.search.includes('product=');

    if (isPublicPage) {
      return <PublicApp />;
    }
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { 
            backgroundColor: theme.colors.card,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18
          },
          tabBarStyle: { display: 'none' }
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
            <Tab.Screen 
              name="Dashboard"
              options={{ headerShown: false }}
            >
              {(props) => <DashboardScreen {...props} onLogout={handleLogout} />}
            </Tab.Screen>
        <Tab.Screen 
          name="Estoque" 
          component={InventoryScreen} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Vender" 
          component={NewSaleScreen} 
          options={{ title: 'Registro de Venda' }}
        />
        <Tab.Screen 
          name="Historico" 
          component={SalesHistoryScreen} 
          options={{ title: 'Histórico de Vendas' }}
        />
        <Tab.Screen 
          name="AddProduct" 
          component={AddProductScreen} 
          options={{ 
            title: 'Adicionar Produto',
            tabBarButton: () => null
          }} 
        />
        <Tab.Screen 
          name="ProductDetails" 
          component={ProductDetailsScreen} 
          options={{ 
            title: 'Detalhes do Produto',
            tabBarButton: () => null,
            headerShown: false
          }} 
        />
        <Tab.Screen 
          name="EditProduct" 
          component={EditProductScreen} 
          options={{ 
            title: 'Editar Produto',
            tabBarButton: () => null
          }} 
        />
        <Tab.Screen 
          name="PublicProduct" 
          component={PublicProductScreen} 
          options={{ 
            title: 'Produto Público',
            tabBarButton: () => null
          }} 
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ 
            title: 'Perfil',
            tabBarButton: () => null,
            headerShown: false
          }} 
        />
            <Tab.Screen
              name="Users"
              component={UsersScreen}
              options={{
                title: 'Usuários',
                tabBarButton: () => null,
                headerShown: false
              }}
            />
            <Tab.Screen
              name="Customers"
              component={CustomersScreen}
              options={{
                title: 'Clientes',
                tabBarButton: () => null,
                headerShown: false
              }}
            />
            <Tab.Screen
              name="AddCustomer"
              component={AddCustomerScreen}
              options={{
                title: 'Adicionar Cliente',
                tabBarButton: () => null
              }}
            />
            <Tab.Screen
              name="PendingPayments"
              component={PendingPaymentsScreen}
              options={{
                title: 'Valores a Receber',
                tabBarButton: () => null,
                headerShown: false
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: 'Configurações',
                tabBarButton: () => null,
                headerShown: false
              }}
            />
      </Tab.Navigator>
    </NavigationContainer>
  );
}


