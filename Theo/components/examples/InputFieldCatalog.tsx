// example/InputFieldCatalog.tsx

import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Spacer, InputField } from "../../components";

export default function InputFieldCatalog() {
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState("6");
  const [time, setTime] = useState("");
  const [withError, setWithError] = useState("");

  return (
    <View>
      <Text style={styles.title}>InputField Catalog</Text>

      {/* Normal login-style inputs */}
      <Text style={styles.section}>Standard Inputs</Text>
      <InputField placeholder="Email" value={email} onChangeText={setEmail} />
      <InputField placeholder="Password" secureTextEntry />

      {/* Label + Error Example */}
      <Text style={styles.section}>Labeled + Error</Text>
      <InputField
        label="Goal:"
        placeholder="Study for midterm"
        value={withError}
        onChangeText={setWithError}
        error={!withError ? "Field is required" : undefined}
      />

      {/* Small / compact input */}
      <Text style={styles.section}>Small Inputs</Text>
      <InputField
        small
        centered
        placeholder="6"
        value={order}
        onChangeText={setOrder}
        keyboardType="numeric"
      />

      {/* Time Input (00 : 00 : 00) */}
      <Text style={styles.section}>Time Input Style</Text>
      <InputField
        placeholder="00 : 00 : 00"
        centered
        noBorder
        value={time}
        onChangeText={setTime}
        keyboardType="numeric"
      />

      {/* Centered play with styles */}
      <Text style={styles.section}>Centered Text</Text>
      <InputField placeholder="Centered text" centered />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "System",
  },
  section: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily: "System",
  },
});
