import React, { useState } from "react";
import {
  View,
  Pressable,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { Icon } from "@/components/ui/Icon";
import { theme } from "@/design/theme";

type MenuOption = {
  label: string;
  onPress: () => void;
};

type MenuProps = {
  options: MenuOption[];
  width?: number;
};

export function Menu({ options, width = 220 }: MenuProps) {
  const [open, setOpen] = useState(false);

  const handlePress = (fn: () => void) => {
    setOpen(false);
    setTimeout(fn, 150); // feels better
  };

  return (
    <>
      {/* Trigger */}
      <Pressable onPress={() => setOpen(true)}>
        <Icon name="more" size={28} />
      </Pressable>

      {/* Menu Modal */}
      <Modal transparent visible={open} animationType="fade">
        {/* Backdrop to dismiss */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        {/* Menu Box */}
        <View style={[styles.menuBox, { width }]}>
          {options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handlePress(opt.onPress)}
              style={[
                styles.option,
                idx !== options.length - 1 && styles.optionBorder,
              ]}
              activeOpacity={0.6}
            >
              <Text variant="body">{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  menuBox: {
    position: "absolute",
    top: 120,
    right: 20,
    backgroundColor: theme.solidColors.white,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderRadius: theme.radii.md,
    overflow: "hidden",
  },

  option: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.solidColors.white,
  },

  optionBorder: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent,
  },
});
