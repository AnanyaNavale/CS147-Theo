import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Spacer } from "../../components";
import { AppModal } from "../ui/AppModal";

export default function ModalCatalog() {
  const [alertVisible, setAlertVisible] = useState(false);
  const [customVisible, setCustomVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <View>
      <Text style={styles.heading}>Modal Catalog</Text>

      <Spacer size="lg" />

      {/* ALERT MODAL DEMO */}
      <View style={styles.section}>
        <Text style={styles.label}>Alert Modal</Text>
        <Spacer size="sm" />
        <Button
          label="Open Alert Modal"
          onPress={() => setAlertVisible(true)}
        />
      </View>

      {/* CUSTOM MODAL DEMO */}
      <View style={styles.section}>
        <Text style={styles.label}>Custom Modal</Text>
        <Spacer size="sm" />
        <Button
          label="Open Custom Modal"
          onPress={() => setCustomVisible(true)}
        />
      </View>

      {/* BOTTOM SHEET DEMO */}
      <View style={styles.section}>
        <Text style={styles.label}>Bottom Sheet Modal</Text>
        <Spacer size="sm" />
        <Button
          label="Open Bottom Sheet"
          onPress={() => setSheetVisible(true)}
        />
      </View>

      {/* ALERT MODAL */}
      <AppModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        variant="alert"
        title="Delete session?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => console.log("Session deleted")}
      />

      {/* CUSTOM MODAL */}
      <AppModal
        visible={customVisible}
        onClose={() => setCustomVisible(false)}
        variant="custom"
        title="Session Manager"
      >
        <Text style={styles.customText}>Choose an option</Text>
        <Spacer size="sm" />
        <Button
          label="Continue Session"
          onPress={() => console.log("Continue")}
        />
        <Spacer size="sm" />
        <Button
          label="Restart Session"
          onPress={() => console.log("Restart")}
        />
        <Spacer size="sm" />
        <Button
          label="Delete Session"
          variant="tertiary"
          onPress={() => console.log("Delete")}
        />
      </AppModal>

      {/* BOTTOM SHEET MODAL */}
      <AppModal
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        variant="bottom-sheet"
        title="Choose a mode"
        height={340}
      >
        <Spacer size="sm" />
        <Button
          label="Guided Reflection"
          onPress={() => console.log("Reflection")}
        />
        <Spacer size="sm" />
        <Button
          label="Regular Conversation"
          onPress={() => console.log("Conversation")}
        />
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 96,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
  },
  customText: {
    fontSize: 16,
    textAlign: "center",
  },
});
