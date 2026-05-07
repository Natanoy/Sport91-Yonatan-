export type Language = 'en' | 'es' | 'pt' | 'ru';
export type Tab = 'home' | 'market' | 'trade' | 'invite' | 'me' | 'admin' | 'bets';

export interface UserNotification {
  id: string;
  type: 'deposit' | 'withdrawal_approved' | 'withdrawal_rejected' | 'bet_success' | 'bet_won' | 'bet_lost' | 'announcement' | 'private_msg';
  title: string;
  message: string;
  timestamp: any;
  read: boolean;
  amount?: number;
}

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'support' | 'manager' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  role?: UserRole;
  isFrozen?: boolean;
  withdrawalDisabled?: boolean;
  depositDisabled?: boolean;
  ipAddress?: string;
  lastLoginIp?: string;
  country?: string;
  city?: string;
  deviceInfo?: string;
  browser?: string;
  isOnline?: boolean;
  lastActiveAt?: any;
  checkInStreak?: number;
  lastCheckInDate?: string | null;
  totalDeposits?: number;
  totalWithdrawals?: number;
  totalBets?: number;
  totalWon?: number;
  totalLost?: number;
  totalRefund?: number;
  vipLevel?: number;
  pendingCommission?: number;
  totalCommission?: number;
  referralCode?: string;
  referralBonus?: number;
  referralStatus?: 'active' | 'inactive';
  referredBy?: string;
  referralCount?: number;
  dailyNewUsers?: number;
  dailyTeamDeposits?: number;
  dailyTeamWithdrawals?: number;
  dailyCommission?: number;
  unliquidated?: number;
  todayProfit?: number;
  weeklyProfit?: number;
  monthlyProfit?: number;
  lastLuckyBoxClaim?: string | null;
  lotteryTickets?: number;
  notifications?: UserNotification[];
  photoURL?: string;
  createdAt: any;
}

export interface SecurityEvent {
  id: string;
  type: 'multi_account' | 'vpn_detected' | 'failed_login' | 'unusual_bet' | 'large_withdrawal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userEmail: string;
  details: string;
  ip: string;
  timestamp: any;
  resolved: boolean;
}

export interface BetRisk {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  totalVolume: number;
  exposure: number; // Potential loss if house loses
  activeBets: number;
  oddsControl?: {
    multiplier: number; // To manually adjust house advantage
    suspended: boolean;
  };
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetUserId?: string;
  details: string;
  timestamp: any;
  duration?: number; // for Live Mode logs
}

export interface SystemSettings {
  platformName: string;
  maintenanceMode: boolean;
  aiProfitMultiplier: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  withdrawalFee: number;
  depositAddress: string;
  network: string;
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
