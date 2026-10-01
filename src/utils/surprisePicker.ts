import { Deck } from "../types/deck";

/** Random deck from `group`, skipping recent picks while leaving one option. */
function chooseFrom(
  group: Deck[],
  recent: string[],
  random: () => number
): Deck | null {
  if (group.length === 0) {
    return null;
  }
  // Capping at `group.length - 1` guarantees `fresh` is non-empty: at most that
  // many of the group can be filtered out.
  const avoidCount = Math.min(recent.length, group.length - 1);
  const avoid = new Set(recent.slice(0, avoidCount));
  const fresh = group.filter((deck) => !avoid.has(deck.id));
  return fresh[Math.floor(random() * fresh.length)] ?? null;
}

/**
 * Picks a deck for Surprise Me.
 *
 * Two things beyond plain randomness:
 *
 * 1. Classic and Spicy get an equal chance. Choosing uniformly across the whole
 *    pool would tie the ratio to how many decks the player owns in each
 *    category, so someone who buys mostly spicy decks would almost never be
 *    shown a classic one. So we pick the category first, then a deck inside it.
 * 2. Recent picks are skipped, so the same deck doesn't come back twice in a
 *    row. Only ever as many as can be skipped while leaving a candidate, which
 *    keeps small pools — and a pool of one — working.
 *
 * `random` is injectable for tests.
 */
export function pickSurpriseDeck(
  pool: Deck[],
  recent: string[],
  random: () => number = Math.random
): Deck | null {
  if (pool.length === 0) {
    return null;
  }

  const classic = pool.filter((deck) => !deck.nsfw);
  const spicy = pool.filter((deck) => deck.nsfw);

  // Second entry is the fallback for when the first category can only offer a
  // deck we just played.
  const order: Deck[][] =
    classic.length === 0 || spicy.length === 0
      ? [classic.length > 0 ? classic : spicy, []]
      : random() < 0.5
        ? [classic, spicy]
        : [spicy, classic];

  const lastPick = recent[0];
  for (const group of order) {
    const choice = chooseFrom(group, recent, random);
    // Crossing to the other category to dodge a back-to-back repeat matters
    // more than holding the ratio exactly: a repeat reads as a bug, a slight
    // skew doesn't. With both categories stocked this never triggers, because
    // a group of 2+ can always exclude the last pick itself.
    if (choice && choice.id !== lastPick) {
      return choice;
    }
  }

  // Every category could only offer the deck we just played, so the pool is
  // effectively a single deck. Repeat it rather than returning nothing.
  return (
    chooseFrom(order[0], recent, random) ??
    chooseFrom(order[1], recent, random)
  );
}
