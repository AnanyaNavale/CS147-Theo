import { Icon } from "@/components/custom/Icon";
import { Text } from "@/components/custom/Text";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import React, { useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type MenuOption = {
  label: string;
  onPress: () => void;
};

type MenuProps = {
  options: MenuOption[];
  width?: number;
};

export function Menu({ options, width = 220 }: MenuProps) {
  const { theme, colors: palette } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<View>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const handlePress = (fn: () => void) => {
    setOpen(false);
    setTimeout(fn, 150); // feels better
  };

  const handleOpen = () => {
    if (triggerRef.current?.measureInWindow) {
      triggerRef.current.measureInWindow((x, y, w, h) => {
        setAnchor({ x, y, w, h });
        setOpen(true);
      });
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => setOpen(false);

  const left = Math.max(
    8,
    Math.min(anchor.x + anchor.w - width, windowWidth - width - 8)
  );
  const top = anchor.y + anchor.h + 6;

  return (
    <>
      {/* Trigger */}
      <Pressable ref={triggerRef} onPress={handleOpen}>
        <Icon name="more" size={28} />
      </Pressable>

      {/* Menu Modal */}
      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.fullscreen}>
          {/* Backdrop to dismiss */}
          <Pressable style={styles.backdrop} onPress={handleClose} />

          {/* Menu Box */}
          <View style={[styles.menuBox, { width, left, top }]}>
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
        </View>
      </Modal>
    </>
  );
}

function createStyles(
  theme: Theme,
  palette: typeof import("@/design/colors").colors.light
) {
  return StyleSheet.create({
    fullscreen: StyleSheet.absoluteFillObject,

    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    menuBox: {
      position: "absolute",
      top: 120,
      right: 20,
      backgroundColor: palette.primary,
      borderWidth: 2,
      borderColor: palette.primary,
      borderRadius: theme.radii.md,
      overflow: "hidden",
    },

    option: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: palette.background,
    },

    optionBorder: {
      borderBottomWidth: 2,
      borderBottomColor: palette.primary,
    },
  });
}
