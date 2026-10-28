import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SAMPLE_BANK_SMS, BankSMSTemplate } from '../services/smsSimulator';
import { SMSListenerService } from '../services/smsListener';

interface SMSListenerScreenProps {
  onTransactionIngested?: () => void;
}

export const SMSListenerScreen: React.FC<SMSListenerScreenProps> = ({ onTransactionIngested }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<BankSMSTemplate>(SAMPLE_BANK_SMS[0]);
  const [customText, setCustomText] = useState(SAMPLE_BANK_SMS[0].sampleMessage);
  const [senderId, setSenderId] = useState(SAMPLE_BANK_SMS[0].sender);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);

  const handleRequestPermissions = async () => {
    const granted = await SMSListenerService.requestPermissions();
    setHasPermission(granted);
    if (!granted) {
      Alert.alert(
        'Notice: Running in Expo Go Sandbox',
        'Google Play strictly disables the RECEIVE_SMS and READ_SMS permissions inside the generic Expo Go app.\n\nTo allow Android to listen to your actual SMS inbox in real time:\n1. Build a standalone APK for your phone:\n   "npx expo run:android"\n2. Or test real bank SMS messages instantly using the Ingestion Playground below!',
        [{ text: 'Understood' }]
      );
    }
  };

  const handleSelectTemplate = (template: BankSMSTemplate) => {
    setSelectedTemplate(template);
    setCustomText(template.sampleMessage);
    setSenderId(template.sender);
    setParsedResult(null);
  };

  const handleTestIngest = async () => {
    setIsLoading(true);
    setParsedResult(null);
    try {
      const res = await SMSListenerService.sendToBackend({
        sender: senderId,
        body: customText,
      });
      setParsedResult(res);
    } catch (err: any) {
      setParsedResult({ success: false, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bank SMS Tracker</Text>
      <Text style={styles.subtitle}>
        Automatically intercepts and parses bank transaction SMS messages on Android.
      </Text>

      {/* Standalone Build Guide Box */}
      <View style={styles.infoCard}>
        <Text style={styles.infoHeader}>📱 Native Android SMS Inbox Listener</Text>
        <Text style={styles.infoText}>
          In Android, reading your physical SMS inbox in the background requires a standalone APK build (<Text style={styles.monoText}>npx expo run:android</Text>).
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={handleRequestPermissions}>
          <Text style={styles.permBtnText}>Check Android SMS Permission</Text>
        </TouchableOpacity>
      </View>

      {/* Live Ingestion Playground */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>📩 Live SMS Ingestion & Auto-Logger</Text>
        <Text style={styles.smallDesc}>
          Paste any incoming bank SMS or choose from real bank presets below to test the parser and log it to your real database:
        </Text>

        {/* Bank Templates */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
          {SAMPLE_BANK_SMS.filter((t) => t.id !== 'gpay_push').map((tpl) => (
            <TouchableOpacity
              key={tpl.id}
              style={[styles.pill, selectedTemplate.id === tpl.id && styles.pillActive]}
              onPress={() => handleSelectTemplate(tpl)}
            >
              <Text style={[styles.pillText, selectedTemplate.id === tpl.id && styles.pillTextActive]}>
                {tpl.bankName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Bank Sender ID:</Text>
        <TextInput
          style={styles.inputSmall}
          value={senderId}
          onChangeText={setSenderId}
          placeholder="e.g. CHASE, HDFCBK, SBIBNK, AMEX"
          placeholderTextColor="#64748B"
        />

        <Text style={styles.label}>Bank SMS Text:</Text>
        <TextInput
          style={styles.inputMulti}
          value={customText}
          onChangeText={setCustomText}
          multiline
          numberOfLines={3}
          placeholder="Paste transaction SMS text..."
          placeholderTextColor="#64748B"
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleTestIngest} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Parse & Save to Database</Text>
          )}
        </TouchableOpacity>

        {/* Output */}
        {parsedResult && (
          <View style={[styles.resultBox, parsedResult.success ? styles.resultSuccess : styles.resultError]}>
            <Text style={styles.resultTitle}>
              {parsedResult.success ? '✅ Saved to Database' : '⚠️ Discarded / Not Financial'}
            </Text>
            <Text style={styles.resultText}>
              {JSON.stringify(parsedResult.data || parsedResult.message || parsedResult.error, null, 2)}
            </Text>

            {parsedResult.success && onTransactionIngested && (
              <TouchableOpacity style={styles.viewTxBtn} onPress={onTransactionIngested}>
                <Text style={styles.viewTxText}>View In Transactions Feed ➔</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginVertical: 8,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  infoHeader: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  monoText: {
    fontFamily: 'monospace',
    color: '#38BDF8',
    backgroundColor: '#0F172A',
  },
  permBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  permBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  smallDesc: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pill: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#38BDF8',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  pillTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  label: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputSmall: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputMulti: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    textAlignVertical: 'top',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  resultBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
  },
  resultSuccess: {
    backgroundColor: '#064E3B',
  },
  resultError: {
    backgroundColor: '#451A03',
  },
  resultTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    marginBottom: 4,
  },
  resultText: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  viewTxBtn: {
    backgroundColor: '#059669',
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewTxText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  spacer: {
    height: 40,
  },
});
