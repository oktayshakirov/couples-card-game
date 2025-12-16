import { Deck } from "../../types/deck";

export const romanticDeck: Deck = {
  id: "romantic",
  name: "Romantic",
  description: "Deep questions for couples",
  icon: "favorite",
  cards: [
    {
      id: "r1",
      truth: "{player1}, what was your first impression of {player2}?",
      dare: "{player1}, write a love letter to {player2} and read it aloud.",
    },
    {
      id: "r2",
      truth:
        "{player1}, what's your favorite thing about {player2}'s personality?",
      dare: "{player1}, give {player2} a 5-minute massage.",
    },
    {
      id: "r3",
      truth: "{player1}, what makes you feel most connected to {player2}?",
      dare: "{player1} and {player2}, slow dance together for 2 minutes.",
    },
    {
      id: "r4",
      truth: "{player1}, what's a dream you have for your future together?",
      dare: "{player1}, plan a surprise date for {player2}.",
    },
    {
      id: "r5",
      truth: "{player1}, what's something {player2} does that makes you smile?",
      dare: "{player1} and {player2}, share your favorite memory together.",
    },
  ],
};
