import { Deck } from "../../types/deck";

export const funDeck: Deck = {
  id: "fun",
  name: "Fun & Games",
  description: "Lighthearted and playful",
  icon: "celebration",
  cards: [
    {
      id: "f1",
      truth: "{player1}, what's the funniest thing {player2} has ever done?",
      dare: "{player1} and {player2}, do your best impressions of each other.",
    },
    {
      id: "f2",
      truth: "{player1}, what's your favorite inside joke with {player2}?",
      dare: "{player1}, tell {player2} a joke and make them laugh.",
    },
    {
      id: "f3",
      truth: "{player1}, what's something silly you love about {player2}?",
      dare: "{player1} and {player2}, have a tickle fight for 30 seconds.",
    },
    {
      id: "f4",
      truth:
        "{player1}, what's the most embarrassing thing that happened to you with {player2}?",
      dare: "{player1}, do a silly dance for {player2}.",
    },
    {
      id: "f5",
      truth: "{player1}, what's your favorite way to have fun with {player2}?",
      dare: "{player1} and {player2}, play rock-paper-scissors best of 5.",
    },
  ],
};

