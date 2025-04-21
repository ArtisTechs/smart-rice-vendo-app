import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import GradientBackground from "@/components/GradientBackground";
import { getMachineByCode } from "@/services/api";

export default function LoginScreen() {
  const [machineCode, setMachineCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Check if machine is already stored
  useEffect(() => {
    const checkStoredMachine = async () => {
      const stored = await AsyncStorage.getItem("machine");
      if (stored) {
        router.replace("/dashboard");
      }
    };

    checkStoredMachine();
  }, []);

  const handleStart = async () => {
    if (!machineCode.trim()) {
      setErrorMessage("Please enter a machine code.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const machine = await getMachineByCode(machineCode.trim());

      // ✅ Save machine to AsyncStorage
      await AsyncStorage.setItem("machine", JSON.stringify(machine));

      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Image
            source={require("@/assets/images/smart-rice-vendo-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Smart Rice Vendo Machine</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Machine Code"
            value={machineCode}
            onChangeText={(text) => {
              setMachineCode(text);
              if (text.trim()) setErrorMessage("");
            }}
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleStart}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Checking..." : "Start"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    padding: 24,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "SpaceMono",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#fbc02d",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
    elevation: 3,
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 12,
    fontSize: 14,
    alignSelf: "flex-start",
  },
});
