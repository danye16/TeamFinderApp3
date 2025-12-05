// src/data/apiGames.ts

// Esta es la interfaz que `react-select` necesita
export interface GameOption {
  value: number; // El ID del juego
  label: string;  // El nombre del juego
}

// Lista estática de juegos con solo ID y nombre
export const popularGames: GameOption[] = [
  { value: 1, label: "Counter-Strike 2" },
  { value: 2, label: "DOTA 2" },
  { value: 3, label: "PUBG: BATTLEGROUNDS" },
  { value: 4, label: "Team Fortress 2" },
  { value: 5, label: "Warframe" },
  { value: 6, label: "Red Dead Redemption 2" },
  { value: 7, label: "Apex Legends" },
  { value: 8, label: "Rust" },
  { value: 9, label: "GTA V" },
  { value: 10, label: "Stardew Valley" },
  { value: 11, label: "Cyberpunk 2077" },
  { value: 12, label: "Left 4 Dead 2" },
  { value: 13, label: "Elden Ring" },
  { value: 14, label: "Rocket League" }
];