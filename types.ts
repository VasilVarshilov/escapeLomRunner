/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE', // Represents Zombies
  GEM = 'GEM', // Represents Fish
  LETTER = 'LETTER',
  SHOP_PORTAL = 'SHOP_PORTAL',
  ALIEN = 'ALIEN', // Represents "Special" Zombies
  MISSILE = 'MISSILE', // Represents Bottles
  BARREL = 'BARREL', // Rolling wine barrel
  ZIGZAG_CRATE = 'ZIGZAG_CRATE', // Beer crate moving diagonal/zig-zag
  CAT = 'CAT', // Black cat crossing the road
  POTHOLE = 'POTHOLE', // Hole in the road
  OLD_CAR = 'OLD_CAR', // Rusty vehicle
  HAY_BALE = 'HAY_BALE' // Farm obstacle
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number]; // x, y, z
  active: boolean;
  value?: string; // For letters
  color?: string;
  targetIndex?: number; // Index in the target word
  points?: number; // Score value
  hasFired?: boolean; 
  
  // Movement Properties
  directionX?: number; // For rolling barrels and cats (-1 or 1)
  initialX?: number; // Reference for ZigZag calculations
  speedZ?: number; // Custom forward speed
  zigzagPhase?: number; // Random offset for sine wave
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; // seconds
export const RUN_SPEED_BASE = 22.5;
export const SPAWN_DISTANCE = 25;
export const REMOVE_DISTANCE = 20; // Behind player

// Palette for letters
export const LETTER_COLORS = [
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#ff8800', // Orange
];

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any; // Lucide icon component
    oneTime?: boolean; // If true, remove from pool after buying
}