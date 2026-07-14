import { useState, useEffect, useCallback } from "react";
import * as Haptics from "expo-haptics";
import {
  getFavoriteCards,
  addFavoriteCard,
  removeFavoriteCard,
  getFavoriteKey,
} from "../utils/favoritesStorage";

interface UseFavoritesReturn {
  isFavorite: (truth: string, dare: string) => boolean;
  toggleFavorite: (truth: string, dare: string) => void;
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const favorites = await getFavoriteCards();
      if (!cancelled) {
        setFavoriteKeys(
          new Set(favorites.map((fav) => getFavoriteKey(fav.truth, fav.dare)))
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isFavorite = useCallback(
    (truth: string, dare: string) =>
      favoriteKeys.has(getFavoriteKey(truth, dare)),
    [favoriteKeys]
  );

  const toggleFavorite = useCallback((truth: string, dare: string) => {
    const key = getFavoriteKey(truth, dare);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFavoriteKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        removeFavoriteCard({ truth, dare }).catch(() => {});
      } else {
        next.add(key);
        addFavoriteCard({ truth, dare }).catch(() => {});
      }
      return next;
    });
  }, []);

  return { isFavorite, toggleFavorite };
};
