import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import quotes from "success-motivational-quotes";

// Simple hash function to turn date string into a number
function getDayIndex(date: Date, total: number) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const dayString = `${year}-${month}-${day}`; // local YYYY-MM-DD

  let hash = 0;
  for (let i = 0; i < dayString.length; i++) {
    hash = (hash << 5) - hash + dayString.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % total;
}

const FIXED_CATEGORY = "Work";
const LOCAL_QUOTES = [
  {
    body: "Success is the sum of small efforts repeated day in and day out.",
    by: "Robert Collier",
    category: "Work",
  },
  {
    body: "The future depends on what you do today.",
    by: "Mahatma Gandhi",
    category: "Work",
  },
  {
    body: "It always seems impossible until it is done.",
    by: "Nelson Mandela",
    category: "Work",
  },
  {
    body: "Quality means doing it right when no one is looking.",
    by: "Henry Ford",
    category: "Work",
  },
  {
    body: "Discipline is the bridge between goals and accomplishment.",
    by: "Jim Rohn",
    category: "Work",
  },
];

const QuoteOfTheDay: React.FC = () => {
  const quotePool = LOCAL_QUOTES;

  // Filter quotes by "Work" category
  let workQuotes = quotePool.filter((q) => q.category === FIXED_CATEGORY);

  // Fallback if no quotes in this category
  if (workQuotes.length === 0) {
    workQuotes = quotePool;
  }
  //   const categories = Array.from(new Set(allQuotes.map((q) => q.category)));

  //   console.log(categories);
  const index = getDayIndex(new Date(), workQuotes.length);
  const todayQuote = workQuotes[index];

  return (
    <View style={styles.container}>
      <Text style={styles.quoteText}>"{todayQuote.body}"</Text>
      <Text style={styles.authorText}>~ {todayQuote.by}</Text>
    </View>
  );
};

export default QuoteOfTheDay;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  quoteText: {
    //width: "75%",
    fontSize: 18,
    fontFamily: fonts.typeface.bodyItalic,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 10,
    color: colors.light.quote,
  },
  authorText: {
    fontSize: 16,
    fontFamily: fonts.typeface.bodyItalic,
    fontWeight: "700",
    textAlign: "center",
    color: colors.light.quote,
  },
});
