import {useState} from 'react';
import {View, Text, TextInput, Pressable, Modal, ScrollView, Switch} from 'react-native';

import {buildSchedule} from '@fuel-plan/schedule-builder';
import type {GeneratedEntry} from '@fuel-plan/schedule-builder';

import {createThemedStyles} from '../theme';
import {formatMinutesAsTime} from '../utils/format';

const useStyles = createThemedStyles((colors) => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fuelSourceChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginTop: 4,
  },
  fuelSourceChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
  },
  chipTextSelected: {
    color: colors.primaryText,
  },
  previewSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  previewTime: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  previewFuel: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  applyText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
}));

type FuelSourceOption = {
  id: string;
  name: string;
};

type Props = {
  visible: boolean;
  fuelSources: FuelSourceOption[];
  onApply: (entries: GeneratedEntry[]) => void;
  onClose: () => void;
};

export default function ScheduleBuilderModal({visible, fuelSources, onApply, onClose}: Props) {
  const styles = useStyles();

  const [interval, setInterval] = useState('30');
  const [startOffset, setStartOffset] = useState('0');
  const [iterations, setIterations] = useState('6');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allEachTime, setAllEachTime] = useState(false);

  function toggleFuelSource(id: string) {
    setSelectedIds(function (prev) {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const preview =
    selectedIds.size > 0
      ? buildSchedule({
          intervalMinutes: parseInt(interval, 10) || 30,
          startMinutes: parseInt(startOffset, 10) || 0,
          fuelSourceIds: [...selectedIds],
          iterations: parseInt(iterations, 10) || 1,
          rotationStrategy: allEachTime ? 'all-each-time' : 'round-robin',
        })
      : [];

  const fuelSourceMap = new Map(fuelSources.map((fs) => [fs.id, fs.name]));

  function handleApply() {
    if (preview.length > 0) {
      onApply(preview);
      onClose();
    }
  }

  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Schedule Builder</Text>

            <Text style={styles.label}>Interval (minutes)</Text>
            <TextInput
              style={styles.input}
              value={interval}
              onChangeText={setInterval}
              keyboardType='number-pad'
            />

            <Text style={styles.label}>Start Offset (minutes)</Text>
            <TextInput
              style={styles.input}
              value={startOffset}
              onChangeText={setStartOffset}
              keyboardType='number-pad'
            />

            <Text style={styles.label}>Iterations</Text>
            <TextInput
              style={styles.input}
              value={iterations}
              onChangeText={setIterations}
              keyboardType='number-pad'
            />

            <Text style={styles.label}>Fuel Sources</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              {fuelSources.map(function (fs) {
                const selected = selectedIds.has(fs.id);
                return (
                  <Pressable
                    key={fs.id}
                    style={[styles.fuelSourceChip, selected && styles.fuelSourceChipSelected]}
                    onPress={() => toggleFuelSource(fs.id)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {fs.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.row, {marginTop: 12}]}>
              <Text style={styles.label}>All each time (vs round-robin)</Text>
              <Switch value={allEachTime} onValueChange={setAllEachTime} />
            </View>

            {preview.length > 0 && (
              <View style={styles.previewSection}>
                <Text style={styles.label}>Preview ({preview.length} entries)</Text>
                {preview.map(function (entry, i) {
                  return (
                    <View key={i} style={styles.previewEntry}>
                      <Text style={styles.previewTime}>
                        {formatMinutesAsTime(entry.timeMinutes)}
                      </Text>
                      <Text style={styles.previewFuel}>
                        {entry.fuelSourceIds.map((id) => fuelSourceMap.get(id) ?? id).join(', ')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.buttonRow}>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyText}>Apply</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
