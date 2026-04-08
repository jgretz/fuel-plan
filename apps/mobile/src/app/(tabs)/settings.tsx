import {View, Text} from 'react-native';

import {useWatchConnectivity} from '../../services/watchConnectivity';
import {createThemedStyles} from '../../theme';

const useStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  connected: {
    color: colors.success,
    fontSize: 15,
    fontWeight: '600',
  },
  disconnected: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
}));

export default function SettingsScreen() {
  const styles = useStyles();
  const {status} = useWatchConnectivity();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apple Watch</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Paired</Text>
          <Text style={status.isPaired ? styles.connected : styles.disconnected}>
            {status.isPaired ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Reachable</Text>
          <Text style={status.isReachable ? styles.connected : styles.disconnected}>
            {status.isReachable ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>App Installed</Text>
          <Text style={status.isWatchAppInstalled ? styles.connected : styles.disconnected}>
            {status.isWatchAppInstalled ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>

      <Text style={styles.version}>Fuel Plan v1.0.0</Text>
    </View>
  );
}
