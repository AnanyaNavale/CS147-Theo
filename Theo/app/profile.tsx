import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { InputField } from "@/components/ui/InputField";
import { Spacer } from "@/components/ui/Spacer";
import { Text } from "@/components/ui/Text";
import { useSupabase } from "@/providers/SupabaseProvider";
import {
  ensureUserProfile,
  fetchUserProfile,
  supabase,
} from "@/lib/supabase";
import { theme } from "@/design/theme";

// Decode base64 into a Uint8Array without bringing along file metadata.
const base64ToUint8Array = (base64: string) => {
  if (typeof atob === "function") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Minimal manual decoder for environments without atob.
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, "");
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i += 4) {
    const enc1 = chars.indexOf(cleaned.charAt(i));
    const enc2 = chars.indexOf(cleaned.charAt(i + 1));
    const enc3 = chars.indexOf(cleaned.charAt(i + 2));
    const enc4 = chars.indexOf(cleaned.charAt(i + 3));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    if (enc1 !== -1) output.push(chr1);
    if (enc3 !== -1 && enc3 !== 64) output.push(chr2);
    if (enc4 !== -1 && enc4 !== 64) output.push(chr3);
  }

  return new Uint8Array(output);
};

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useSupabase();
  const user = session?.user;

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profile = await fetchUserProfile(user.id);
      setDisplayName(
        profile?.display_name ??
          (user.user_metadata?.display_name as string | undefined) ??
          ""
      );
      setEmail(user.email ?? "");
      setAvatarUrl(
        profile?.avatar_url ??
          (user.user_metadata?.avatar_url as string | undefined) ??
          null
      );
    } catch (err) {
      console.error(err);
      setError("Couldn't load your profile right now.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    loadProfile();
  }, [user, router, loadProfile]);

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updatePayload: any = {
        data: {
          display_name: displayName || null,
          avatar_url: avatarUrl || null,
        },
      };

      if (email && email !== user.email) {
        updatePayload.email = email.trim();
      }

      const { error: authError } = await supabase.auth.updateUser(
        updatePayload
      );
      if (authError) throw authError;

      await ensureUserProfile({
        id: user.id,
        displayName: displayName || null,
        avatarUrl: avatarUrl || null,
      });

      setMessage("Profile updated.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update profile.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const pickAndUploadAvatar = async () => {
    if (uploading) return;
    setError(null);
    setMessage(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
    setError("Permission required to access photos.");
    return;
  }

  // Prefer new MediaType API; fall back to legacy MediaTypeOptions for older SDKs.
  const mediaTypeImageEnum =
    (ImagePicker as any).MediaType?.Images ??
    (ImagePicker as any).MediaType?.Image ??
    null;
  const mediaTypes =
    mediaTypeImageEnum != null
      ? [mediaTypeImageEnum] // new API prefers an array of enums
      : (ImagePicker as any).MediaTypeOptions?.Images ?? ImagePicker.MediaTypeOptions.Images;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes,
    allowsEditing: true,
      aspect: [1, 1], // keep selection square for circular crop
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const manip = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 600 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const fileExt = manip.uri.split(".").pop() || "jpg";
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const loadImageBytes = async () => {
        try {
          const response = await fetch(manip.uri);
          // Prefer raw bytes from the processed image (avoids uploading the wrapper object)
          const buffer = await response.arrayBuffer();
          if (buffer.byteLength > 0) return new Uint8Array(buffer);
        } catch {
          // fall through to FileSystem
        }

        const base64 = await FileSystem.readAsStringAsync(manip.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return base64ToUint8Array(base64);
      };

      let fileBytes: Uint8Array | null = null;
      try {
        fileBytes = await loadImageBytes();
      } catch (err) {
        console.error("Failed to read image bytes", err);
      }

      if (!fileBytes || fileBytes.byteLength === 0) {
        throw new Error(
          "Image data was empty after processing. Please try again."
        );
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        // Upload only the raw image bytes (no extra file object wrapper)
        .upload(filePath, fileBytes, {
          upsert: true,
          contentType: "image/jpeg",
        });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      // Persist to profile immediately and reload to reflect any server-side transforms
      await ensureUserProfile({
        id: user.id,
        displayName: displayName || null,
        avatarUrl: publicUrl,
      });
      await loadProfile();
      setMessage("Photo updated.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to upload image.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container padded style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="arrow-left" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <Text variant="h1" style={styles.title}>
              Profile
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <Spacer size="lg" />

          <View style={styles.avatarRow}>
            <TouchableOpacity
              onPress={pickAndUploadAvatar}
              disabled={uploading || loading}
              style={styles.avatarButton}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, styles.avatarFallback]}>
                  <Feather name="user" size={68} color={theme.solidColors.white} />
                </View>
              )}
              {uploading && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to update photo</Text>
          </View>

          <Spacer />

          <InputField
            label="Name"
            placeholder="Your name"
            value={displayName}
            onChangeText={setDisplayName}
            editable={!loading && !saving}
            containerStyle={styles.inputContainer}
          />

          <InputField
            label="Email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading && !saving}
            containerStyle={styles.inputContainer}
          />

          {error && (
            <View style={[styles.banner, styles.errorBanner]}>
              <Text style={styles.bannerText}>{error}</Text>
            </View>
          )}
          {message && (
            <View style={[styles.banner, styles.infoBanner]}>
              <Text style={styles.bannerText}>{message}</Text>
            </View>
          )}

          <Button
            label={saving ? "Saving..." : "Save changes"}
            onPress={handleSave}
            variant="brown"
            size="lg"
            disabled={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingVertical: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
  },
  infoText: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  banner: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    alignSelf: "center",
    marginTop: theme.spacing.xs,
  },
  bannerText: {
    color: theme.solidColors.white,
    fontFamily: theme.typography.families.regular,
  },
  infoBanner: {
    backgroundColor: theme.colors.text,
  },
  errorBanner: {
    backgroundColor: theme.colors.danger,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarRow: {
    alignItems: "center",
  },
  avatarButton: {
    width: 192,
    height: 192,
    borderRadius: 96,
    overflow: "hidden",
    ...theme.shadow.medium,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarFallback: {
    backgroundColor: theme.colors.accentDark,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: theme.colors.accentDark,
    borderRadius: 12,
    padding: 6,
    ...theme.shadow.soft,
  },
  avatarHint: {
    marginTop: theme.spacing.sm,
    color: theme.colors.mutedText,
    fontFamily: theme.typography.families.regular,
  },
  inputContainer: {
    width: "92%",
    alignSelf: "center",
  },
  saveButton: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    width: "70%",
    alignSelf: "center",
    ...theme.shadow.medium,
  },
});
