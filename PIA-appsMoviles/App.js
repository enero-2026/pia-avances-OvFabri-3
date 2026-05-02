import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Colores de la app
const COLORS = {
  primary: '#1D9E75',
  background: '#FFFFFF',
  tabBar: '#FFFFFF',
  inactive: '#9E9E9E',
  border: '#F0F0F0',
};

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // Icono de cada pestaña
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Inicio') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Cámara') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else if (route.name === 'Perfil') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },

          // Estilos de la barra de navegación
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.inactive,
          tabBarStyle: {
            backgroundColor: COLORS.tabBar,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },

          // Estilos del header de cada pantalla
          headerStyle: {
            backgroundColor: COLORS.background,
            shadowColor: 'transparent',  // iOS
            elevation: 0,               // Android
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '700',
            color: '#1A1A1A',
          },
          headerTintColor: COLORS.primary,
        })}
      >
        <Tab.Screen
          name="Inicio"
          component={HomeScreen}
          options={{
            title: 'TareaGo',
            headerTitle: 'TareaGo ✓',
          }}
        />
        <Tab.Screen
          name="Cámara"
          component={CameraScreen}
          options={{
            title: 'Cámara',
            headerTitle: 'Tomar Evidencia',
          }}
        />
        <Tab.Screen
          name="Perfil"
          component={ProfileScreen}
          options={{
            title: 'Perfil',
            headerTitle: 'Mi Perfil',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});