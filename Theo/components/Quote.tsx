// import { colors } from "@/assets/themes/colors";
// import { fonts } from "@/assets/themes/typography";
// import React from "react";
// import { StyleSheet, Text, View } from "react-native";
// import quotes from "success-motivational-quotes";

// // Simple hash function to turn date string into a number
// function getDayIndex(date: Date, total: number) {
//   const year = date.getFullYear();
//   const month = (date.getMonth() + 1).toString().padStart(2, "0");
//   const day = date.getDate().toString().padStart(2, "0");

//   const dayString = `${year}-${month}-${day}`; // local YYYY-MM-DD

//   let hash = 0;
//   for (let i = 0; i < dayString.length; i++) {
//     hash = (hash << 5) - hash + dayString.charCodeAt(i);
//     hash |= 0;
//   }
//   return Math.abs(hash) % total;
// }

// const FIXED_CATEGORY = "Work";
// const LOCAL_QUOTES = [
//   {
//     body: "Success is the sum of small efforts repeated day in and day out.",
//     by: "Robert Collier",
//     category: "Work",
//   },
//   {
//     body: "The future depends on what you do today.",
//     by: "Mahatma Gandhi",
//     category: "Work",
//   },
//   {
//     body: "It always seems impossible until it is done.",
//     by: "Nelson Mandela",
//     category: "Work",
//   },
//   {
//     body: "Quality means doing it right when no one is looking.",
//     by: "Henry Ford",
//     category: "Work",
//   },
//   {
//     body: "Discipline is the bridge between goals and accomplishment.",
//     by: "Jim Rohn",
//     category: "Work",
//   },
// ];

// const QuoteOfTheDay: React.FC = () => {
//   const quotePool = LOCAL_QUOTES;

//   // Filter quotes by "Work" category
//   let workQuotes = quotePool.filter((q) => q.category === FIXED_CATEGORY);

//   // Fallback if no quotes in this category
//   if (workQuotes.length === 0) {
//     workQuotes = quotePool;
//   }

//   // const categories = Array.from(new Set(allQuotes.map((q) => q.category)));

//   // console.log(categories);
//   const index = getDayIndex(new Date(), workQuotes.length);
//   const todayQuote = workQuotes[index];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.quoteText}>"{todayQuote.body}"</Text>
//       <Text style={styles.authorText}>~ {todayQuote.by}</Text>
//     </View>
//   );
// };

// export default QuoteOfTheDay;

// const styles = StyleSheet.create({
//   container: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   quoteText: {
//     //width: "75%",
//     fontSize: 18,
//     fontFamily: fonts.typeface.bodyItalic,
//     fontStyle: "italic",
//     textAlign: "center",
//     marginBottom: 10,
//     color: colors.light.quote,
//   },
//   authorText: {
//     fontSize: 16,
//     fontFamily: fonts.typeface.bodyItalic,
//     fontWeight: "700",
//     textAlign: "center",
//     color: colors.light.quote,
//   },
// });

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { useAppTheme } from "@/hooks/ThemeContext";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

// Public-domain / safely usable quotes
const LOCAL_QUOTES = [
  { body: "Well done is better than well said.", by: "Benjamin Franklin" },
  {
    body: "Do not wait to strike till the iron is hot; but make it hot by striking.",
    by: "William Butler Yeats",
  },
  {
    body: "It always seems impossible until it is done.",
    by: "Nelson Mandela",
  },
  { body: "Whatever you are, be a good one.", by: "Abraham Lincoln" },
  { body: "The secret of getting ahead is getting started.", by: "Mark Twain" },
  {
    body: "Action is the foundational key to all success.",
    by: "Pablo Picasso",
  },
  {
    body: "Don't watch the clock; do what it does. Keep going.",
    by: "Sam Levenson",
  },
  { body: "Well begun is half done.", by: "Aristotle" },
  {
    body: "The best way to predict the future is to invent it.",
    by: "Alan Kay",
  },
  {
    body: "Success is the sum of small efforts repeated day in and day out.",
    by: "Robert Collier",
  },
  { body: "The harder I work, the luckier I get.", by: "Samuel Goldwyn" },
  {
    body: "Do what you can, with what you have, where you are.",
    by: "Theodore Roosevelt",
  },
  {
    body: "Knowing is not enough; we must apply. Willing is not enough; we must do.",
    by: "Johann Wolfgang von Goethe",
  },
  {
    body: "Energy and persistence conquer all things.",
    by: "Benjamin Franklin",
  },
  {
    body: "Great works are performed not by strength, but by perseverance.",
    by: "Samuel Johnson",
  },
  {
    body: "Don't judge each day by the harvest you reap but by the seeds that you plant.",
    by: "Robert Louis Stevenson",
  },
  {
    body: "Do not be embarrassed by your failures, learn from them and start again.",
    by: "Richard Branson",
  },
  {
    body: "I find that the harder I work, the more luck I seem to have.",
    by: "Thomas Jefferson",
  },
  { body: "You miss 100% of the shots you don’t take.", by: "Wayne Gretzky" },
  {
    body: "Start where you are. Use what you have. Do what you can.",
    by: "Arthur Ashe",
  },
  {
    body: "What you do today can improve all your tomorrows.",
    by: "Ralph Marston",
  },
  {
    body: "Perseverance is failing 19 times and succeeding the 20th.",
    by: "Julie Andrews",
  },
  {
    body: "Do the difficult things while they are easy and do the great things while they are small.",
    by: "Lao Tzu",
  },
  {
    body: "The only way to do great work is to love what you do.",
    by: "Steve Jobs",
  },
  {
    body: "Small deeds done are better than great deeds planned.",
    by: "Peter Marshall",
  },
  {
    body: "He who is not courageous enough to take risks will accomplish nothing in life.",
    by: "Muhammad Ali",
  },
  {
    body: "Things may come to those who wait, but only the things left by those who hustle.",
    by: "Abraham Lincoln",
  },
  {
    body: "The road to success is dotted with many tempting parking spaces.",
    by: "Will Rogers",
  },
  { body: "Nothing will work unless you do.", by: "Maya Angelou" },
  {
    body: "Do not be afraid to give up the good to go for the great.",
    by: "John D. Rockefeller",
  },
  {
    body: "If you want to lift yourself up, lift up someone else.",
    by: "Booker T. Washington",
  },
  {
    body: "The future belongs to those who believe in the beauty of their dreams.",
    by: "Eleanor Roosevelt",
  },
  {
    body: "It does not matter how slowly you go as long as you do not stop.",
    by: "Confucius",
  },
  {
    body: "Opportunity is missed by most people because it is dressed in overalls and looks like work.",
    by: "Thomas Edison",
  },
  {
    body: "Motivation is what gets you started. Habit is what keeps you going.",
    by: "Jim Ryun",
  },
  {
    body: "Do not let what you cannot do interfere with what you can do.",
    by: "John Wooden",
  },
  {
    body: "Success is not in what you have, but who you are.",
    by: "Bo Bennett",
  },
  {
    body: "You cannot escape the responsibility of tomorrow by evading it today.",
    by: "Abraham Lincoln",
  },
  {
    body: "If you are not willing to risk the unusual, you will have to settle for the ordinary.",
    by: "Jim Rohn",
  },
  {
    body: "Things turn out best for the people who make the best of the way things turn out.",
    by: "John Wooden",
  },
  {
    body: "Continuous effort — not strength or intelligence — is the key to unlocking our potential.",
    by: "Winston Churchill",
  },
  {
    body: "Do not wait; the time will never be ‘just right.’ Start where you stand.",
    by: "Napoleon Hill",
  },
  {
    body: "Success usually comes to those who are too busy to be looking for it.",
    by: "Henry David Thoreau",
  },
  {
    body: "Courage is resistance to fear, mastery of fear, not absence of fear.",
    by: "Mark Twain",
  },
  {
    body: "The way to get started is to quit talking and begin doing.",
    by: "Walt Disney",
  },
  {
    body: "Failure is the condiment that gives success its flavor.",
    by: "Truman Capote",
  },
  {
    body: "Great things are not done by impulse, but by a series of small things brought together.",
    by: "Vincent Van Gogh",
  },
  {
    body: "Happiness is not something ready made. It comes from your own actions.",
    by: "Dalai Lama",
  },
  { body: "Well done is better than well said.", by: "Benjamin Franklin" },
  {
    body: "Do not wait for leaders; do it alone, person to person.",
    by: "Mother Teresa",
  },
  {
    body: "Start by doing what’s necessary; then do what’s possible; and suddenly you are doing the impossible.",
    by: "Francis of Assisi",
  },
];

// Deterministic daily index
function getDayIndex(date: Date, total: number) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const dayString = `${y}-${m}-${d}`;

  let hash = 0;
  for (let i = 0; i < dayString.length; i++) {
    hash = (hash << 5) - hash + dayString.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % total;
}

const QuoteOfTheDay: React.FC = () => {
  const [quote, setQuote] = useState<{ body: string; by: string } | null>(null);
  const { colors: palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  useEffect(() => {
    const index = getDayIndex(new Date(), LOCAL_QUOTES.length);
    setQuote(LOCAL_QUOTES[index]);
  }, []);

  if (!quote) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.quoteText}>"{quote.body}"</Text>
      <Text style={styles.authorText}>~ {quote.by}</Text>
    </View>
  );
};

export default QuoteOfTheDay;

const createStyles = (palette: typeof colors.light) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
    },
    quoteText: {
      fontSize: 18,
      fontFamily: fonts.typeface.bodyItalic,
      fontStyle: "italic",
      textAlign: "center",
      marginBottom: 10,
      color: palette.quote,
    },
    authorText: {
      fontSize: 16,
      fontFamily: fonts.typeface.bodyItalic,
      fontWeight: "700",
      textAlign: "center",
      color: palette.quote,
    },
  });
