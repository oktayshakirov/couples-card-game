// Helper function to get icon source for deck icons
export const getDeckIconSource = (icon: string) => {
  const iconMap: Record<string, any> = {
    cupid: require("../../assets/images/cupid.png"),
    hearts: require("../../assets/images/hearts.png"),
    elexir: require("../../assets/images/elexir.png"),
    fate: require("../../assets/images/fate.png"),
    potion: require("../../assets/images/potion.png"),
  };

  return iconMap[icon] || null;
};

export const getBadgeIconSource = (isNsfw: boolean) => {
  if (isNsfw) {
    return require("../../assets/images/devil.png");
  }
  return require("../../assets/images/angel.png");
};

export const isImageIcon = (icon: string): boolean => {
  return (
    icon === "cupid" ||
    icon === "hearts" ||
    icon === "elexir" ||
    icon === "fate" ||
    icon === "potion"
  );
};
