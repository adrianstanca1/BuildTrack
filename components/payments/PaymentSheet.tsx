import { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useStripe, type PaymentSheetError } from '@stripe/stripe-react-native';
import { apiClient } from '../../services/api';

interface PaymentSheetProps {
  invoiceId: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentSheet({ invoiceId, amount, currency, onSuccess, onCancel }: PaymentSheetProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const initialise = useCallback(async () => {
    setLoading(true);
    try {
      const { clientSecret } = await apiClient.createPaymentIntent(invoiceId);
      if (!clientSecret) throw new Error('Failed to initialise payment');

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'BuildTrack',
        allowsDelayedPaymentMethods: false,
        style: 'alwaysDark',
      });

      if (error) throw error;
      return true;
    } catch (err: any) {
      Alert.alert('Payment Error', err?.message || 'Could not initialise payment sheet');
      return false;
    } finally {
      setLoading(false);
    }
  }, [invoiceId, initPaymentSheet]);

  const open = useCallback(async () => {
    if (loading) return;
    const ready = await initialise();
    if (!ready) return;

    const { error } = await presentPaymentSheet();
    if (error) {
      if (error.code === 'Canceled') {
        onCancel?.();
        return;
      }
      Alert.alert('Payment Failed', error.message);
      return;
    }

    // Confirm on server
    try {
      await apiClient.confirmPayment(invoiceId);
      Alert.alert('Payment Successful', 'Invoice paid successfully');
      onSuccess?.();
    } catch (err: any) {
      Alert.alert('Confirmation Error', err?.message || 'Payment succeeded but confirmation failed');
    }
  }, [initialise, presentPaymentSheet, invoiceId, onSuccess, onCancel, loading]);

  return (
    <Pressable
      onPress={open}
      disabled={loading}
      className="flex-row items-center justify-center bg-blue-600 rounded-xl px-4 py-3 active:opacity-80"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Text className="text-white font-semibold mr-2">Pay</Text>
          <Text className="text-white font-bold">£{amount.toFixed(2)}</Text>
        </>
      )}
    </Pressable>
  );
}
