import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal
} from 'react-native';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = ['Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Salario', 'Otros'];
const TYPES = [{ label: 'Ingreso', value: 'income' }, { label: 'Gasto', value: 'expense' }];

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];

function CalendarPicker({ value, onChange, onClose, theme }) {
  const parseDate = (str) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const initial = parseDate(value);
  const [year, setYear]     = useState(initial.getFullYear());
  const [month, setMonth]   = useState(initial.getMonth());
  const [selected, setSelected] = useState(initial.getDate());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const confirm = () => {
    if (!selected) return;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(selected).padStart(2, '0');
    onChange(`${year}-${mm}-${dd}`);
    onClose();
  };

  const c = calStyles(theme);

  return (
    <View style={c.container}>
      <View style={c.header}>
        <TouchableOpacity onPress={prevMonth} style={c.navBtn}>
          <Text style={c.navTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={c.monthTitle}>{MONTHS_ES[month]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} style={c.navBtn}>
          <Text style={c.navTxt}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={c.weekRow}>
        {DAYS_ES.map(d => <Text key={d} style={c.weekDay}>{d}</Text>)}
      </View>

      <View style={c.grid}>
        {cells.map((day, idx) => {
          const isSelected = day === selected;
          return (
            <TouchableOpacity
              key={idx}
              style={[c.cell, isSelected && c.cellSelected, !day && { opacity: 0 }]}
              onPress={() => day && setSelected(day)}
              disabled={!day}
            >
              <Text style={[c.cellTxt, isSelected && c.cellTxtSel]}>{day || ''}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={c.footer}>
        <TouchableOpacity onPress={onClose} style={c.cancelBtn}>
          <Text style={c.cancelTxt}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={confirm} style={[c.confirmBtn, !selected && { opacity: 0.4 }]}>
          <Text style={c.confirmTxt}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const calStyles = (theme) => StyleSheet.create({
  container:  { backgroundColor: theme.card, borderRadius: 16, padding: 16, margin: 16 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navBtn:     { padding: 8 },
  navTxt:     { fontSize: 24, color: '#2196F3', fontWeight: 'bold' },
  monthTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  weekRow:    { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  weekDay:    { width: 36, textAlign: 'center', fontSize: 12, fontWeight: '600', color: theme.muted },
  grid:       { flexDirection: 'row', flexWrap: 'wrap' },
  cell:       { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  cellSelected: { backgroundColor: '#2196F3' },
  cellTxt:    { fontSize: 14, color: theme.text },
  cellTxtSel: { color: '#fff', fontWeight: 'bold' },
  footer:     { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn:  { paddingHorizontal: 16, paddingVertical: 9 },
  cancelTxt:  { color: theme.muted, fontSize: 14 },
  confirmBtn: { backgroundColor: '#2196F3', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 9 },
  confirmTxt: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default function TransactionFormScreen({ route, navigation }) {
  const { theme } = useTheme();
  const existing = route.params?.transaction;

  const [amount, setAmount]           = useState(existing?.amount?.toString() || '');
  const [type, setType]               = useState(existing?.type || 'expense');
  const [category, setCategory]       = useState(existing?.category || CATEGORIES[0]);
  const [accountId, setAccountId]     = useState(existing?.accountId || '');
  const [date, setDate]               = useState(existing?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(existing?.description || '');
  const [accounts, setAccounts]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [showCal, setShowCal]         = useState(false);

  useEffect(() => {
    client.get('/accounts').then(r => {
      setAccounts(r.data);
      if (!accountId && r.data.length > 0) setAccountId(r.data[0].id);
    }).catch(() => Alert.alert('Error', 'No se cargaron las cuentas'));
  }, []);

  const handleSave = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return Alert.alert('Error', 'Ingresa un monto válido');
    if (!accountId) return Alert.alert('Error', 'Selecciona una cuenta');
    setLoading(true);
    try {
      const payload = { amount: Number(amount), type, category, accountId, date, description };
      if (existing) await client.put(`/transactions/${existing.id}`, payload);
      else await client.post('/transactions', payload);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (iso) => {
    const [y, m, d] = iso.split('-');
    return `${d} ${MONTHS_ES[Number(m) - 1]} ${y}`;
  };

  const Selector = ({ options, value, onSelect, labelKey = 'label', valueKey = 'value' }) => (
    <View style={s.selectorRow}>
      {options.map(opt => {
        const val = typeof opt === 'string' ? opt : opt[valueKey];
        const lbl = typeof opt === 'string' ? opt : opt[labelKey];
        const active = value === val;
        return (
          <TouchableOpacity
            key={val}
            style={[s.chip, active && s.chipActive]}
            onPress={() => onSelect(val)}
          >
            <Text style={[s.chipText, active && s.chipTextActive]}>{lbl}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const s = styles(theme);

  return (
    <>
      <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: '#2196F3', fontSize: 14 }}>← Volver</Text>
        </TouchableOpacity>
        <Text style={s.title}>{existing ? 'Editar' : 'Nueva'} transacción</Text>

        <Text style={s.label}>Tipo</Text>
        <Selector options={TYPES} value={type} onSelect={setType} />

        <Text style={s.label}>Monto ($)</Text>
        <TextInput
          style={s.input}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={theme.muted}
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={s.label}>Categoría</Text>
        <Selector options={CATEGORIES} value={category} onSelect={setCategory} />

        <Text style={s.label}>Cuenta</Text>
        <Selector
          options={accounts}
          value={accountId}
          onSelect={setAccountId}
          labelKey="name"
          valueKey="id"
        />

        <Text style={s.label}>Fecha</Text>
        <TouchableOpacity style={s.dateBtn} onPress={() => setShowCal(true)}>
          <Text style={{ fontSize: 20 }}>📅</Text>
          <Text style={s.dateTxt}>{formatDateDisplay(date)}</Text>
          <Text style={{ fontSize: 20, color: theme.muted }}>›</Text>
        </TouchableOpacity>

        <Text style={s.label}>Descripción (opcional)</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: Compra del supermercado"
          placeholderTextColor={theme.muted}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveBtnText}>Guardar</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showCal} transparent animationType="fade" onRequestClose={() => setShowCal(false)}>
        <View style={s.modalOverlay}>
          <CalendarPicker
            value={date}
            onChange={setDate}
            onClose={() => setShowCal(false)}
            theme={theme}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = (theme) => ({
  container:      { flex: 1, backgroundColor: theme.bg },
  title:          { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: theme.text },
  label:          { fontSize: 14, fontWeight: '600', marginBottom: 6, color: theme.subtext, marginTop: 14 },
  input:          { backgroundColor: theme.inputBg, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: theme.border, fontSize: 16, color: theme.text },
  selectorRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: theme.chip },
  chipActive:     { backgroundColor: '#2196F3' },
  chipText:       { color: theme.chipText },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  dateBtn:        { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: theme.border, gap: 10 },
  dateTxt:        { flex: 1, fontSize: 16, color: theme.text },
  saveBtn:        { backgroundColor: '#2196F3', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 28 },
  saveBtnText:    { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center' },
});