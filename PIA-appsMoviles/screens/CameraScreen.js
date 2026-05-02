import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// ─── Colores (mismo que HomeScreen) ─────────────────────────────────────────
const COLORS = {
  primary:      '#1D9E75',
  primaryLight: '#E1F5EE',
  background:   '#F7F8FA',
  card:         '#FFFFFF',
  border:       '#EBEBEB',
  text:         '#1A1A1A',
  textMuted:    '#888',
  textLight:    '#BBB',
  dark:         '#111111',
};

// ─── Componente principal ────────────────────────────────────────────────────
export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing]             = useState('back');
  const [photo, setPhoto]               = useState(null);
  const [loading, setLoading]           = useState(false);
  const cameraRef                       = useRef(null);

  // ── Aún cargando permisos
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ── Sin permiso de cámara
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.permissionTitle}>Permiso de cámara</Text>
          <Text style={styles.permissionSub}>
            TareaGo necesita acceso a tu cámara para tomar fotos de evidencia.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={requestPermission}>
            <Text style={styles.btnPrimaryText}>Dar permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Tomar foto
  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setLoading(true);
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      setPhoto(result.uri);
    } catch (e) {
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Elegir foto de galería
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sin permiso', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // ── Voltear cámara
  const flipCamera = () => {
    setFacing(prev => (prev === 'back' ? 'front' : 'back'));
  };

  // ── Descartar foto
  const discardPhoto = () => {
    Alert.alert(
      'Descartar foto',
      '¿Quieres tomar otra foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, descartar', style: 'destructive', onPress: () => setPhoto(null) },
      ]
    );
  };

  // ── Usar foto
  const usePhoto = () => {
    Alert.alert(
      '¡Foto guardada!',
      'La evidencia fue adjuntada a tu tarea.',
      [{ text: 'OK', onPress: () => setPhoto(null) }]
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // VISTA PREVIA
  if (photo) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.previewImage} resizeMode="cover" />

          <View style={styles.previewInfo}>
            <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
            <Text style={styles.previewText}>Foto lista para usar como evidencia</Text>
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={discardPhoto}>
              <Ionicons name="refresh-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.btnSecondaryText}>Retomar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnPrimary} onPress={usePhoto}>
              <Ionicons name="checkmark-outline" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Usar foto</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VISTA CÁMARA
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Top bar */}
        <View style={styles.cameraTopBar}>
          <Text style={styles.cameraHint}>Enfoca la evidencia de tu tarea</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={flipCamera}>
            <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Marco guía */}
        <View style={styles.guideFrame} pointerEvents="none">
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* Bottom bar */}
        <View style={styles.cameraBottomBar}>
          <TouchableOpacity style={styles.sideBtn} onPress={pickFromGallery}>
            <Ionicons name="images-outline" size={26} color="#fff" />
            <Text style={styles.sideBtnText}>Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutterBtn}
            onPress={takePicture}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.primary} />
              : <View style={styles.shutterInner} />
            }
          </TouchableOpacity>

          <View style={styles.sideBtn} />
        </View>
      </CameraView>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  // Sin permiso
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  permissionSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },

  // Cámara
  cameraContainer: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cameraHint: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.85,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Marco guía
  guideFrame: {
    alignSelf: 'center',
    width: 220,
    height: 220,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#fff',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },

  // Controles inferiores
  cameraBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sideBtn: {
    width: 64,
    alignItems: 'center',
    gap: 4,
  },
  sideBtnText: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.85,
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },

  // Preview
  previewContainer: {
    padding: 16,
    gap: 16,
  },
  previewImage: {
    width: '100%',
    height: 340,
    borderRadius: 16,
    backgroundColor: COLORS.border,
  },
  previewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 12,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    flex: 1,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  btnPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnSecondaryText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
});