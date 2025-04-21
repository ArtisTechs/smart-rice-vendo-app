import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  children: React.ReactNode;
};

export default function GradientBackground({ children }: Props) {
  return (
    <LinearGradient
      colors={["#ffffff", "#fff176"]} // white to yellow
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
