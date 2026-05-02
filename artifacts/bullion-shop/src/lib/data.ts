export const spotPrices = {
  gold: 2430.00,
  silver: 31.20,
  platinum: 1010.00,
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  metal: 'Gold' | 'Silver' | 'Platinum';
  type: 'Coins' | 'Bars' | 'Rounds';
  weight: string;
  purity: string;
  mint: string;
  year: number;
  description: string;
  featured?: boolean;
};

const BASE = "/bullion-shop/";

export const products: Product[] = [
  {
    id: "ase-bu-2020",
    name: "2020 1 oz American Silver Eagle BU",
    price: 38.50,
    metal: "Silver",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".999 fine silver",
    mint: "US Mint",
    year: 2020,
    description: "The 2020 American Silver Eagle Brilliant Uncirculated bullion coin contains one troy ounce of .999 fine silver. Struck by the United States Mint, it features Adolph Weinman's iconic Walking Liberty obverse design and John Mercanti's heraldic eagle reverse, unchanged from the original 1986 issue.",
    featured: true,
    image: BASE + "silver-coin.png"
  },
  {
    id: "ase-bu-2021",
    name: "2021 1 oz American Silver Eagle BU (Type 1)",
    price: 42.00,
    metal: "Silver",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".999 fine silver",
    mint: "US Mint",
    year: 2021,
    description: "The 2021-W American Silver Eagle Type 1 is the final year of the original classic design first introduced in 1986. Features Walking Liberty on the obverse and John Mercanti's heraldic eagle on the reverse. Highly sought after as the last of its kind before the redesign.",
    featured: true,
    image: BASE + "silver-coin.png"
  },
  {
    id: "ase-bu-2022",
    name: "2022 1 oz American Silver Eagle BU",
    price: 37.75,
    metal: "Silver",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".999 fine silver",
    mint: "US Mint",
    year: 2022,
    description: "The 2022 American Silver Eagle Brilliant Uncirculated coin marks the second year of the updated reverse design by Emily Damstra, featuring a soaring bald eagle with a small eaglet. The Walking Liberty obverse by Adolph Weinman remains unchanged. Struck in .999 fine silver.",
    featured: true,
    image: BASE + "silver-coin.png"
  },
  {
    id: "ase-bu-2023",
    name: "2023 1 oz American Silver Eagle BU",
    price: 36.50,
    metal: "Silver",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".999 fine silver",
    mint: "US Mint",
    year: 2023,
    description: "The 2023 American Silver Eagle is struck in one troy ounce of .999 fine silver at the United States Mint. Brilliant Uncirculated (BU) coins are struck for investment purposes and show no wear. Each coin is packaged in a protective capsule preserving its mirror-bright finish.",
    image: BASE + "silver-coin.png"
  },
  {
    id: "ase-bu-2024",
    name: "2024 1 oz American Silver Eagle BU",
    price: 35.80,
    metal: "Silver",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".999 fine silver",
    mint: "US Mint",
    year: 2024,
    description: "The 2024 American Silver Eagle BU bullion coin is struck in one full troy ounce of .999 fine silver and carries a $1 face value backed by the United States government. One of the world's most recognizable silver bullion coins, it is IRA-eligible and universally liquid.",
    image: BASE + "silver-coin.png"
  },
  {
    id: "ase-bu-2025",
    name: "2025 1 oz American Silver Eagle BU",
    price: 35.95,
    metal: "Silver",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".999 fine silver",
    mint: "US Mint",
    year: 2025,
    description: "The 2025 American Silver Eagle Brilliant Uncirculated bullion coin is the current-year issue from the United States Mint. Contains exactly one troy ounce of .999 fine silver. Perfect for stacking, investment portfolios, and Precious Metals IRAs. Ships in protective capsule.",
    featured: true,
    image: BASE + "silver-coin.png"
  },
  {
    id: "ase-bu-2026",
    name: "2026 1 oz American Silver Eagle BU",
    price: 37.25,
    metal: "Silver",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".999 fine silver",
    mint: "US Mint",
    year: 2026,
    description: "The 2026 American Silver Eagle is the newest addition to the iconic series, celebrating 40 years of the American Silver Eagle program first launched in 1986. Struck in one troy ounce of .999 fine silver with Brilliant Uncirculated finish. Pre-order pricing available.",
    featured: true,
    image: BASE + "silver-coin.png"
  }
];
