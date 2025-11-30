import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    const load = async () => {
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
    };

    load();
  }, [user, router]);

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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
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

      const response = await fetch(manip.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setMessage("Photo updated. Save to apply.");
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
                <Image
                  source={require("../assets/images/profile_sample.webp")}
                  style={styles.avatarImage}
                />
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
            <Text color="danger" style={styles.infoText}>
              {error}
            </Text>
          )}
          {message && (
            <Text color="accentDark" style={styles.infoText}>
              {message}
            </Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarRow: {
    alignItems: "center",
  },
  avatarButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    ...theme.shadow.medium,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
