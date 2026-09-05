const IMAGE_ICONS: Record<string, any> = {
  cupid: require("../../assets/images/cupid.png"),
  hearts: require("../../assets/images/hearts.png"),
  elixir: require("../../assets/images/elixir.png"),
  fate: require("../../assets/images/fate.png"),
  potion: require("../../assets/images/potion.png"),
  timeless: require("../../assets/images/timeless.png"),
  honeymoon: require("../../assets/images/honeymoon.png"),
  partners: require("../../assets/images/partners.png"),
  fruit: require("../../assets/images/fruit.png"),
  nights: require("../../assets/images/nights.png"),
  "twin-hearts": require("../../assets/images/twin-hearts.png"),
  mask: require("../../assets/images/mask.png"),
  "sugar-spice": require("../../assets/images/sugar-spice.png"),
  "love-nest": require("../../assets/images/love-nest.png"),
  "ever-after": require("../../assets/images/ever-after.png"),
  games: require("../../assets/images/games.png"),
  "long-distance": require("../../assets/images/long-distance.png"),
};

export const getDeckIconSource = (icon: string) => {
  return IMAGE_ICONS[icon] || null;
};

export const getBadgeIconSource = (isNsfw: boolean) => {
  if (isNsfw) {
    return require("../../assets/images/devil.png");
  }
  return require("../../assets/images/angel.png");
};

export const isImageIcon = (icon: string): boolean => {
  return icon in IMAGE_ICONS;
};
