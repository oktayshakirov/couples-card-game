import { Deck } from "../../types/deck";

export const deepDeck: Deck = {
  id: "deep",
  name: "Deep Conversations",
  description: "Meaningful questions for deeper connection",
  icon: "auto-awesome",
  cards: [
    {
      id: "d1",
      truth: "{player1}, what's your biggest fear about your relationship?",
      dare: "{player1}, share something vulnerable with {player2}.",
    },
    {
      id: "d2",
      truth: "{player1}, what's something you've never told {player2}?",
      dare: "{player1}, express your deepest feelings for {player2}.",
    },
    {
      id: "d3",
      truth: "{player1}, what's a goal you want to achieve together?",
      dare: "{player1} and {player2}, make a promise to each other.",
    },
    {
      id: "d4",
      truth:
        "{player1}, what's something you'd like to change about your relationship?",
      dare: "{player1}, have an honest conversation with {player2} about your relationship.",
    },
    {
      id: "d5",
      truth:
        "{player1}, what's the most important thing {player2} has taught you?",
      dare: "{player1}, write down what you're grateful for about {player2} and share it.",
    },
  ],
};

