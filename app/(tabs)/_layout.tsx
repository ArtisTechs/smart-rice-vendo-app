import { Slot, Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function TabsLayout() {
  const [authorized, setAuthorized] = useState<null | boolean>(null);

  useEffect(() => {
    AsyncStorage.getItem("machineCode").then((code) => {
      setAuthorized(!!code);
    });
  }, []);

  if (authorized === null) return null;

  return authorized ? <Slot /> : <Redirect href="/login" />;
}
