import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Colores ────────────────────────────────────────────────────────────────
const COLORS = {
  primary:      '#1D9E75',
  primaryLight: '#E1F5EE',
  danger:       '#E24B4A',
  dangerLight:  '#FCEBEB',
  warning:      '#EF9F27',
  warningLight: '#FAEEDA',
  background:   '#F7F8FA',
  card:         '#FFFFFF',
  border:       '#EBEBEB',
  text:         '#1A1A1A',
  textMuted:    '#888',
  textLight:    '#BBB',
};

// ─── Datos iniciales de ejemplo ──────────────────────────────────────────────
const INITIAL_TASKS = [];

// ─── Componente principal ────────────────────────────────────────────────────
export default function HomeScreen() {
  const [tasks, setTasks]           = useState(INITIAL_TASKS);
  const [filter, setFilter]         = useState('all');   // 'all' | 'pending' | 'completed'
  const [modalVisible, setModal]    = useState(false);
  const [newTaskTitle, setNewTitle] = useState('');

  // ── Filtrar tareas según pestaña activa
  const filteredTasks = tasks.filter(t => {
    if (filter === 'all')       return true;
    if (filter === 'pending')   return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
  });

  // ── Estadísticas rápidas
  const total     = tasks.length;
  const pending   = tasks.filter(t => t.status === 'pending').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  // ── Agregar tarea nueva
  const addTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Espera', 'Escribe un nombre para la tarea 📝');
      return;
    }
    const nueva = {
      id:       Date.now().toString(),
      title:    newTaskTitle.trim(),
      status:   'pending',
      hasPhoto: false,
      date:     'Ahora',
    };
    setTasks(prev => [nueva, ...prev]);
    setNewTitle('');
    setModal(false);
  };

  // ── Cambiar estado pendiente ↔ completada
  const toggleTask = (id) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' }
          : t
      )
    );
  };

  // ── Eliminar tarea con confirmación
  const deleteTask = (id) => {
    Alert.alert(
      'Eliminar tarea',
      '¿Seguro que quieres eliminarla?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => setTasks(prev => prev.filter(t => t.id !== id)),
        },
      ]
    );
  };

  // ── Render de cada tarjeta
  const renderTask = ({ item }) => {
    const isDone = item.status === 'completed';
    return (
      <View style={[styles.card, isDone && styles.cardDone]}>
        {/* Círculo check */}
        <TouchableOpacity
          style={[styles.checkCircle, isDone && styles.checkCircleDone]}
          onPress={() => toggleTask(item.id)}
          activeOpacity={0.7}
        >
          {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
        </TouchableOpacity>

        {/* Contenido */}
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, isDone && styles.cardTitleDone]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.cardMeta}>
            <View style={[styles.badge, isDone ? styles.badgeDone : styles.badgePending]}>
              <Text style={[styles.badgeText, isDone ? styles.badgeTextDone : styles.badgeTextPending]}>
                {isDone ? 'Completada' : 'Pendiente'}
              </Text>
            </View>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>

        {/* Ícono foto */}
        <View style={[styles.photoIcon, item.hasPhoto && styles.photoIconActive]}>
          <Ionicons
            name={item.hasPhoto ? 'camera' : 'camera-outline'}
            size={16}
            color={item.hasPhoto ? COLORS.primary : COLORS.textLight}
          />
        </View>

        {/* Botón eliminar */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteTask(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  // ── Estado vacío
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="checkmark-done-circle-outline" size={56} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>Sin tareas aquí</Text>
      <Text style={styles.emptySub}>Toca + para agregar una nueva tarea</Text>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Stats row ── */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statNum}>{total}</Text>
          <Text style={styles.statLbl}>Total</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: COLORS.warning }]}>{pending}</Text>
          <Text style={styles.statLbl}>Pendientes</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: COLORS.primary }]}>{completed}</Text>
          <Text style={styles.statLbl}>Completadas</Text>
        </View>
      </View>

      {/* ── Filter tabs ── */}
      <View style={styles.filterRow}>
        {['all', 'pending', 'completed'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendiente' : 'Completada'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Lista de tareas ── */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={[
          styles.listContent,
          filteredTasks.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Botón flotante + ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* ── Modal nueva tarea ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Nueva tarea</Text>

            <TextInput
              style={styles.input}
              placeholder="¿Qué tienes que hacer?"
              placeholderTextColor={COLORS.textLight}
              value={newTaskTitle}
              onChangeText={setNewTitle}
              autoFocus
              multiline
              maxLength={120}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => { setModal(false); setNewTitle(''); }}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnAdd} onPress={addTask}>
                <Text style={styles.btnAddText}>Agregar tarea</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLbl: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Filtros
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: '#fff',
  },

  // Lista
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 10,
  },

  // Tarjeta
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardDone: {
    opacity: 0.65,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 19,
  },
  cardTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePending: {
    backgroundColor: COLORS.warningLight,
  },
  badgeDone: {
    backgroundColor: COLORS.primaryLight,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextPending: {
    color: '#854F0B',
  },
  badgeTextDone: {
    color: COLORS.primary,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  photoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  photoIconActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textLight,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    gap: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  btnAdd: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  btnAddText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});