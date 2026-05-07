export type Language = 'en' | 'es' | 'pt' | 'ru';
export type Tab = 'home' | 'market' | 'trade' | 'invite' | 'me' | 'admin' | 'bets';

export interface UserNotification {
  id: string;
  type: 'deposit' | 'withdrawal_approved' | 'withdrawal_rejected' | 'bet_success' | 'bet_won' | 'bet_lost';
  title: string;
  message: string;
  timestamp: any;
  read: boolean;
  amount?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  role?: 'admin' | 'user';
  checkInStreak?: number;
  lastCheckInDate?: string | null;
  totalDeposits?: number;
  totalBets?: number;
  vipLevel?: number;
  pendingCommission?: number;
  totalRefund?: number;
  referralBonus?: number;
  referralStatus?: 'active' | 'inactive';
  dailyNewUsers?: number;
  dailyTeamDeposits?: number;
  dailyTeamWithdrawals?: number;
  dailyCommission?: number;
  unliquidated?: number;
  todayProfit?: number;
  weeklyProfit?: number;
  lastLuckyBoxClaim?: string | null;
  lotteryTickets?: number;
  notifications?: UserNotification[];
  createdAt: any;
}

export type MatchStatus = 'upcoming' | 'live' | 'finished';

export interface AntiScoreOdds {
  [score: string]: number; // score: ROI percentage (e.g., "1-1": 8.5)
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  startTime: any;
  status: MatchStatus;
  league: string;
  leagueLogo?: string;
  isReal?: boolean;
  finalScore?: string;
  antiScoreOdds: AntiScoreOdds;
}

export type BetStatus = 'pending' | 'won' | 'lost' | 'canceled';

export interface Bet {
  id: string;
  userId: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  selectedScore: string;
  amount: number;
  roi: number;
  status: BetStatus;
  createdAt: any;
}
