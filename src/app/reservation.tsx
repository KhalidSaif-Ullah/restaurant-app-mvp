
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useReservation from '../hooks/useReservation';

export default function Reservation() {
  const router = useRouter();
  const { theme } = useTheme();

  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    partySize,
    setPartySize,
    contact,
    setContact,
    timeSlots,
    reservations,
    createReservation,
    cancelReservation,
    isSlotAvailable,
  } = useReservation();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleReserve = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await createReservation();

      if (!result.success) {
        Alert.alert(
          'Reservation Failed',
          result.message || 'Could not create your reservation.'
        );
        return;
      }

      setShowConfirmation(true);
    } catch (error: any) {
      Alert.alert(
        'Reservation Failed',
        error.message || 'Could not create your reservation.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (id: string) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            if (isCancelling) return;

            setIsCancelling(true);

            try {
              const result = await cancelReservation(id);

              if (!result.success) {
                Alert.alert(
                  'Cancellation Failed',
                  result.message || 'Could not cancel the reservation.'
                );
                return;
              }

              Alert.alert(
                'Reservation Cancelled',
                'Your reservation has been cancelled.'
              );
            } catch (error: any) {
              Alert.alert(
                'Cancellation Failed',
                error.message || 'Could not cancel the reservation.'
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text
          style={[
            styles.title,
            { color: theme.text },
          ]}
        >
          Table Reservation
        </Text>

        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Date
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.text,
            },
          ]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#888"
          value={selectedDate}
          onChangeText={setSelectedDate}
        />

        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Party Size
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.text,
            },
          ]}
          keyboardType="numeric"
          value={String(partySize)}
          onChangeText={(value) =>
            setPartySize(Number(value) || 0)
          }
        />

        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Pakistani Phone
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.text,
            },
          ]}
          placeholder="03XX-XXXXXXX"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={contact}
          onChangeText={setContact}
        />

        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Select Time
        </Text>

        <View style={styles.timeGrid}>
          {timeSlots.map((time) => {
            const available = isSlotAvailable(
              selectedDate,
              time
            );

            return (
              <TouchableOpacity
                key={time}
                disabled={!available}
                style={[
                  styles.timeButton,
                  !available && styles.disabledTimeButton,
                  selectedTime === time && styles.selectedTimeButton,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedTime === time && styles.selectedTimeText,
                    !available && styles.disabledTimeText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.reserveButton,
            isSubmitting && styles.disabledButton,
          ]}
          onPress={handleReserve}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Reserve Table
            </Text>
          )}
        </TouchableOpacity>

        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          My Reservations
        </Text>

        {reservations.length === 0 ? (
          <Text
            style={[
              styles.emptyText,
              { color: theme.text },
            ]}
          >
            No reservations yet.
          </Text>
        ) : (
          reservations.map((reservation) => (
            <View
              key={reservation.id}
              style={[
                styles.reservationCard,
                { backgroundColor: theme.card },
              ]}
            >
              <Text
                style={[
                  styles.reservationText,
                  { color: theme.text },
                ]}
              >
                {reservation.date} at {reservation.time}
              </Text>

              <Text
                style={[
                  styles.reservationText,
                  { color: theme.text },
                ]}
              >
                Party: {reservation.partySize}
              </Text>

              <Text
                style={[
                  styles.reservationText,
                  { color: theme.text },
                ]}
              >
                Table: {reservation.tableId || 'Not assigned'}
              </Text>

              <Text
                style={[
                  styles.reservationText,
                  { color: theme.text },
                ]}
              >
                Status: {reservation.status}
              </Text>

              {reservation.status !== 'Cancelled' && (
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    isCancelling && styles.disabledButton,
                  ]}
                  onPress={() => handleCancel(reservation.id)}
                  disabled={isCancelling}
                >
                  <Text style={styles.buttonText}>
                    {isCancelling ? 'Please wait...' : 'Cancel'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: theme.text },
              ]}
            >
              Reservation Submitted
            </Text>

            <Text
              style={[
                styles.modalText,
                { color: theme.text },
              ]}
            >
              Your reservation for {selectedDate} at {selectedTime}
              has been saved. Its current status is Pending until
              the restaurant confirms it.
            </Text>

            <TouchableOpacity
              style={styles.reserveButton}
              onPress={() => setShowConfirmation(false)}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    minHeight: 45,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  timeButton: {
    minWidth: 70,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTimeButton: {
    backgroundColor: '#333',
  },
  disabledTimeButton: {
    opacity: 0.35,
  },
  timeText: {
    color: '#222',
    fontWeight: '600',
  },
  selectedTimeText: {
    color: '#fff',
  },
  disabledTimeText: {
    color: '#555',
  },
  reserveButton: {
    backgroundColor: '#333',
    minHeight: 45,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  emptyText: {
    marginTop: 5,
  },
  reservationCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reservationText: {
    marginBottom: 5,
  },
  cancelButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  backButton: {
    backgroundColor: '#333',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  modalCard: {
    width: '100%',
    borderRadius: 12,
    padding: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 23,
  },
});