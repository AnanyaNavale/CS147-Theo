import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Button, Container, Checkbox } from "../../components";
import { View, Text } from "react-native";
import ModalCatalog from "@/components/examples/ModalCatalog";
import InputFieldCatalog from "@/components/examples/InputFieldCatalog";
import { ButtonCatalog } from "@/components/examples/ButtonCatalog";
import { ChatBubbleCatalog } from "@/components/examples/ChatBubbleCatalog";

export default function Example() {
  const [one, setOne] = useState(true);
  const [two, setTwo] = useState(false);

  return (
    <ScrollView>
      <InputFieldCatalog />
      <ModalCatalog />
      <ButtonCatalog />
      <ChatBubbleCatalog />
      <View style={{ padding: 24 }}>
        <Checkbox
          checked={one}
          onChange={setOne}
          label="Layout basic screens and identify key features."
        />

        <Checkbox
          checked={two}
          onChange={setTwo}
          label="Incorporate design system components."
        />
      </View>
    </ScrollView>
  );
}
