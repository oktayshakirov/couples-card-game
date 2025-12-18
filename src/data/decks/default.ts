import { Deck } from "../../types/deck";

export const defaultDeck: Deck = {
  id: "default",
  name: "Classic",
  description: "The original truth or dare questions",
  icon: "favorite",
  isDefault: true,
  cards: [
    {
      id: "1",
      truth: "{player1}, what do you admire most about {player2}?",
      dare: "{player1}, look {player2} in the eyes and compliment them for 10 seconds.",
    },
    {
      id: "2",
      truth: "{player1}, what's your favorite memory with {player2}?",
      dare: "{player1}, give {player2} a 30-second shoulder massage.",
    },
    {
      id: "3",
      truth: "{player1}, what makes you feel most loved by {player2}?",
      dare: "{player1}, share three things you're grateful for about {player2}.",
    },
    {
      id: "4",
      truth:
        "{player1}, what's something you've always wanted to tell {player2}?",
      dare: "{player1} and {player2}, do a silly dance together for 20 seconds.",
    },
    {
      id: "5",
      truth: "{player1}, what's {player2}'s best quality?",
      dare: "{player1} and {player2}, hold hands and share what you love about each other.",
    },
    {
      id: "6",
      truth: "{player1}, what's a dream you and {player2} share?",
      dare: "{player1} and {player2}, plan a future date together in detail.",
    },
    {
      id: "7",
      truth: "{player1}, what makes you and {player2} laugh together?",
      dare: "{player1} and {player2}, tell each other your funniest memory together.",
    },
    {
      id: "8",
      truth:
        "{player1}, what's something new you'd like to try with {player2}?",
      dare: "{player1} and {player2}, give each other a high-five and say 'We got this!'",
    },
    {
      id: "9",
      truth: "{player1}, what's {player2}'s love language?",
      dare: "{player1}, express your love to {player2} in their love language right now.",
    },
    {
      id: "10",
      truth:
        "{player1}, what's one thing you'd like to improve with {player2}?",
      dare: "{player1} and {player2}, make a promise to each other and seal it with a kiss.",
    },
  ],
};
