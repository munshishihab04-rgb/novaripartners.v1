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
  description: string;
  featured?: boolean;
};

const BASE = "/bullion-shop/";

export const products: Product[] = [
  {
    id: "age-1oz",
    name: "American Gold Eagle 1oz",
    price: 2485,
    metal: "Gold",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".9167 (22-karat)",
    mint: "US Mint",
    description: "The American Gold Eagle is the official gold bullion coin of the United States. Authorized under the Gold Bullion Coin Act of 1985, it contains exactly one troy ounce of gold in an alloy of 91.67% gold, 3% silver, and 5.33% copper.",
    featured: true,
    image: BASE + "gold-coin.png"
  },
  {
    id: "age-half-oz",
    name: "American Gold Eagle 1/2oz",
    price: 1265,
    metal: "Gold",
    type: "Coins",
    weight: "0.5 Troy oz",
    purity: ".9167 (22-karat)",
    mint: "US Mint",
    description: "The 1/2 oz American Gold Eagle provides a highly liquid and accessible way to add US Mint gold to your portfolio. Backed by the US government for weight and purity.",
    image: BASE + "gold-coin.png"
  },
  {
    id: "ase-1oz",
    name: "American Silver Eagle 1oz",
    price: 34.50,
    metal: "Silver",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".999 fine silver",
    mint: "US Mint",
    description: "The American Silver Eagle is the official silver bullion coin of the United States. First released in 1986, it contains one troy ounce of .999 fine silver and is among the most recognized silver coins in the world.",
    featured: true,
    image: BASE + "silver-coin.png"
  },
  {
    id: "cml-gold-1oz",
    name: "Canadian Gold Maple Leaf 1oz",
    price: 2470,
    metal: "Gold",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".9999 (24-karat)",
    mint: "Royal Canadian Mint",
    description: "The Gold Maple Leaf is renowned for its exceptional .9999 fine gold purity and advanced security features. Issued annually by the Royal Canadian Mint with a face value of $50 CAD.",
    featured: true,
    image: BASE + "gold-coin.png"
  },
  {
    id: "krugerrand-gold-1oz",
    name: "Gold Krugerrand 1oz",
    price: 2455,
    metal: "Gold",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".9167 (22-karat)",
    mint: "South African Mint",
    description: "First minted in 1967, the Gold Krugerrand is the most widely traded gold bullion coin in the world. Features the portrait of Paul Kruger and a springbok antelope on the reverse.",
    image: BASE + "gold-coin.png"
  },
  {
    id: "ape-1oz",
    name: "American Platinum Eagle 1oz",
    price: 1085,
    metal: "Platinum",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".9995 fine platinum",
    mint: "US Mint",
    description: "The official platinum bullion coin of the United States, backed by the US government for weight, content, and purity. Contains one full troy ounce of .9995 fine platinum.",
    featured: true,
    image: BASE + "platinum-coin.png"
  },
  {
    id: "ase-monster-box",
    name: "Silver American Eagle Monster Box (500 coins)",
    price: 16500,
    metal: "Silver",
    type: "Coins",
    weight: "500 Troy oz",
    purity: ".999 fine silver",
    mint: "US Mint",
    description: "An original mint-sealed box containing 500 1oz American Silver Eagle coins across 25 tubes of 20 coins each. The ultimate way to accumulate silver. Arrives factory-sealed.",
    image: BASE + "silver-coin.png"
  },
  {
    id: "pamp-silver-10oz",
    name: "10oz Silver Bar (PAMP Suisse)",
    price: 325,
    metal: "Silver",
    type: "Bars",
    weight: "10 Troy oz",
    purity: ".999 fine silver",
    mint: "PAMP Suisse",
    description: "Premium cast silver bar from the prestigious PAMP Suisse refinery in Geneva, Switzerland. Features the iconic Lady Fortuna design and is sealed in CertiPAMP assay card packaging.",
    featured: true,
    image: BASE + "silver-bar.png"
  },
  {
    id: "pamp-gold-1oz",
    name: "1oz Gold Bar (PAMP Suisse)",
    price: 2475,
    metal: "Gold",
    type: "Bars",
    weight: "1 Troy oz",
    purity: ".9999 (24-karat)",
    mint: "PAMP Suisse",
    description: "Exquisite 1oz .9999 fine gold bar sealed in CertiPAMP packaging with assay card. Widely recognized by dealers and collectors worldwide as the premium standard for gold bars.",
    featured: true,
    image: BASE + "gold-bar.png"
  },
  {
    id: "cml-silver-1oz",
    name: "Canadian Silver Maple Leaf 1oz",
    price: 33.80,
    metal: "Silver",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".9999 fine silver",
    mint: "Royal Canadian Mint",
    description: "Among the purest official bullion coins in the world at .9999 fine silver. The Silver Maple Leaf is highly liquid, recognized globally, and features advanced security including radial lines and a micro-engraved maple leaf.",
    image: BASE + "silver-coin.png"
  },
  {
    id: "silver-bar-100oz",
    name: "100oz Silver Bar",
    price: 3200,
    metal: "Silver",
    type: "Bars",
    weight: "100 Troy oz",
    purity: ".999 fine silver",
    mint: "Various",
    description: "Industrial-scale 100oz silver bar, the most cost-effective way to accumulate physical silver with the lowest premium over spot. Brands may include PAMP, Engelhard, or Johnson Matthey.",
    image: BASE + "silver-bar.png"
  },
  {
    id: "buffalo-gold-1oz",
    name: "American Gold Buffalo 1oz",
    price: 2510,
    metal: "Gold",
    type: "Coins",
    weight: "1 Troy oz",
    purity: ".9999 (24-karat)",
    mint: "US Mint",
    description: "The US Mint's first 24-karat gold coin, introduced in 2006. Features the iconic design adapted from James Earle Fraser's 1913 Buffalo Nickel — a bison on one side and a Native American on the other.",
    image: BASE + "gold-coin.png"
  }
];
