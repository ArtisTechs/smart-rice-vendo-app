import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { getTransactionsByDateRange } from "@/services/api";
import GradientBackground from "@/components/GradientBackground";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface Transaction {
  id: string;
  dateTime: string;
  price: number;
  payment: number;
  paymentMethod: string;
}

export default function Dashboard() {
  const today = new Date();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [showPicker, setShowPicker] = useState<"from" | "to" | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const slideAnim = useState(new Animated.Value(-SCREEN_WIDTH))[0];

  useEffect(() => {
    const timeout = setTimeout(() => setShowWelcome(false), 2500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!showWelcome) {
      fetchTransactions();
    }
  }, [fromDate, toDate, showWelcome]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuVisible ? 0 : -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuVisible]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactionsByDateRange(fromDate, toDate);
      setTransactions(data);
      setTotalIncome(
        data.reduce((sum: number, t: Transaction) => sum + t.payment, 0)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("machine");
    setMenuVisible(false);
    router.replace("/login");
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.priceText}>Price: ₱{item.price.toFixed(2)}</Text>
      <Text style={styles.paymentText}>
        Paid: ₱{item.payment.toFixed(2)} • {item.paymentMethod}
      </Text>
      <Text style={styles.transactionSubText}>
        {moment(item.dateTime).format("MMM D, YYYY • hh:mm A")}
      </Text>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Ionicons name="menu" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <View style={{ width: 28 }} />
          </View>

          <AnimatePresence>
            {showWelcome ? (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={styles.welcomeContainer}
              >
                <Text style={styles.welcomeText}>Welcome to</Text>
                <Text style={styles.welcomeTextBold}>
                  Smart Rice Vendo Machine
                </Text>
                <ActivityIndicator
                  size="large"
                  color="#000"
                  style={{ marginTop: 20 }}
                />
              </MotiView>
            ) : (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 500 }}
                style={{ flex: 1 }}
              >
                <View style={styles.dateRow}>
                  <TouchableOpacity
                    onPress={() => setShowPicker("from")}
                    style={styles.dateButton}
                  >
                    <Text>From: {moment(fromDate).format("MMM D, YYYY")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowPicker("to")}
                    style={styles.dateButton}
                  >
                    <Text>To: {moment(toDate).format("MMM D, YYYY")}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.incomeText}>
                  Total Income: ₱{totalIncome.toFixed(2)}
                </Text>
                <Text style={styles.daysText}>
                  Showing transaction(s) for{" "}
                  {moment(toDate).diff(moment(fromDate), "days") + 1} day(s)
                </Text>

                <FlatList
                  data={transactions}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  refreshing={loading}
                  onRefresh={fetchTransactions}
                  contentContainerStyle={{ paddingBottom: 100 }}
                />
              </MotiView>
            )}
          </AnimatePresence>

          <DateTimePickerModal
            isVisible={showPicker !== null}
            mode="date"
            date={showPicker === "from" ? fromDate : toDate}
            onConfirm={(selectedDate) => {
              setShowPicker(null);
              if (showPicker === "from") setFromDate(selectedDate);
              else setToDate(selectedDate);
            }}
            onCancel={() => setShowPicker(null)}
          />

          {/* Side Sheet */}
          {isMenuVisible && (
            <Pressable
              onPress={() => setMenuVisible(false)}
              style={StyleSheet.absoluteFillObject}
            >
              <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }} />
            </Pressable>
          )}

          <Animated.View
            style={[
              styles.sideSheet,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
              <Ionicons name="log-out-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingEnd: 20,
    paddingStart: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    color: "#333",
  },
  welcomeTextBold: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 5,
    color: "#000",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },
  incomeText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  daysText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  transactionItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  transactionSubText: {
    fontSize: 14,
    color: "#777",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  sideSheet: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
