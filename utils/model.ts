export interface UserSession {
  id: number;
  name: string;
  role: string;
  profile_image: string;
}

export interface User {
  id: number;
  name: string;
  role: string;
  profile_image: string;
  password: string;
}

export interface CheckInData {
  id: number;
  image?: string;
  message?: string;
}

export interface GoogleUserInfo {
  email: string;
  name: string;
}

export interface Award {
  image?: string;
  name?: string;
  score?: number;
  quantity?: number;
  status?: string;
}
export interface AwardRecord {
  user_id: number;
  score: number;
  score_description_id: number;
  award_id: number;
}

export interface Game {
  user_id: number;
  media: string;
  target_location: string;
  answer_name: string;
  answer_address: string;
  answer_description: string;
  hints_1: string;
  hints_2: string;
  status: string;
}

export interface GameHistory {
  user_id: number;
  game_id: number;
  attempts: number;
  is_win: boolean;
}

export interface ScoreData {
  user_id: number;
  score_change: number;
  score_description_id: number;
}
export interface StoreData {
  user_id: number;
  game_id: number;
  amount_change: number;
}

export interface Preference {
  user_id: number;
  game_id: number;
  type: string;
}
