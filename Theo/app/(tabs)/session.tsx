import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";

export default function SessionScreen() {
  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [theoImage, setTheoImage] = useState(
    require("../../assets/theo/working.png")
  );

  const [showStopModal, setShowStopModal] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  // Timer start/stop logic
  useEffect(() => {
    if (isRunning) {
      // ensure Theo shows working while running
      setTheoImage(require("../../assets/theo/working.png"));

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // auto-stop at zero
  useEffect(() => {
    if (secondsLeft <= 0) {
      setIsRunning(false);
      setSecondsLeft(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      Alert.alert("Session complete", "Great work!");
    }
  }, [secondsLeft]);

  const handlePlayPause = () => {
    setIsRunning((prev) => !prev);
    // When starting, the effect sets Theo to working; when pausing, we leave current image alone.
  };

  const handleBreak = () => {
    // Pause timer and show break Theo
    setIsRunning(false);
    setTheoImage(require("../../assets/theo/break.png"));
  };

  const handleStop = () => {
    setShowStopModal(true);
  };

  const confirmStop = () => {
    setShowStopModal(false);
    setIsRunning(false);
    setSecondsLeft(1500);
    setTheoImage(require("../../assets/theo/working.png"));
  };

  const cancelStop = () => setShowStopModal(false);

  return (
    <View style={styles.container}>
      <Image source={theoImage} style={styles.theo} />

      <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>

      <View style={styles.row}>
        <Pressable style={styles.button} onPress={handlePlayPause}>
          <Image
            source={
              isRunning
                ? require("../../assets/icons/pause.png")
                : require("../../assets/icons/play.png")
            }
            style={styles.icon}
          />
        </Pressable>

        <Pressable style={styles.button} onPress={handleStop}>
          <Image
            source={require("../../assets/icons/stop.png")}
            style={styles.icon}
          />
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => {
            router.push("/chat");
          }}
        >
          <Image
            source={require("../../assets/icons/chat.png")}
            style={styles.icon}
          />
        </Pressable>

        <Pressable style={styles.button} onPress={handleBreak}>
          <Image
            source={require("../../assets/icons/break.png")}
            style={styles.icon}
          />
        </Pressable>
      </View>

      <Modal visible={showStopModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>End session?</Text>

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={cancelStop}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.confirmBtn} onPress={confirmStop}>
                <Text style={styles.confirmText}>End</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  theo: { width: 220, height: 220, resizeMode: "contain", marginBottom: 16 },
  timer: { fontSize: 48, fontWeight: "600", marginBottom: 24 },
  row: { flexDirection: "row", gap: 20 },
  button: { padding: 8 },
  icon: { width: 48, height: 48, resizeMode: "contain" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    width: 280,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalText: { fontSize: 18, marginBottom: 16 },
  modalButtons: { flexDirection: "row", gap: 16 },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  confirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#ff5a5a",
    borderRadius: 8,
  },
  cancelText: { fontSize: 16 },
  confirmText: { color: "white", fontSize: 16 },
});
