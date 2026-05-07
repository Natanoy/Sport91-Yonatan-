import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bet, Match, UserProfile, UserNotification } from '../types';

export async function resolvePendingBets(userId?: string) {
  console.log('Starting bet resolution process...');
  
  try {
    // 1. Get pending bets. If userId is provided, filter by it.
    let betsQuery = query(collection(db, 'bets'), where('status', '==', 'pending'));
    if (userId) {
      betsQuery = query(collection(db, 'bets'), where('status', '==', 'pending'), where('userId', '==', userId));
    }
    const betsSnap = await getDocs(betsQuery);
    
    if (betsSnap.empty) {
      return { success: true, message: 'No pending bets found' };
    }

    const bets = betsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Bet));
    let resolvedCount = 0;

    for (const bet of bets) {
      // 2. Check match status
      const matchDoc = await getDoc(doc(db, 'matches', bet.matchId));
      if (!matchDoc.exists()) continue;
      
      const match = matchDoc.data() as Match;
      
      // Only resolve if match is finished and has a final score
      if (match.status === 'finished' && match.finalScore) {
        const isWin = bet.selectedScore !== match.finalScore;
        const roiMultiplier = bet.roi / 100;
        
        // CAPITAL INSURED LOGIC:
        // If Win: Stake + Profit
        // If Loss: Stake back (Profit is 0)
        const profit = isWin ? (bet.amount * roiMultiplier) : 0;
        const payout = bet.amount + profit;

        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'users', bet.userId);
          const userSnap = await transaction.get(userRef);
          
          if (!userSnap.exists()) return;
          
          const userData = userSnap.data() as UserProfile;
          const currentBalance = userData.balance || 0;
          const newBalance = currentBalance + payout;
          
          // Create Notification
          const newNotification: UserNotification = {
            id: Math.random().toString(36).substring(2, 9),
            type: isWin ? 'bet_won' : 'bet_lost',
            title: isWin ? 'Liquidación: ¡Éxito!' : 'Liquidación: Protección 100%',
            message: isWin 
              ? `Operación finalizada con éxito en el encuentro ${bet.homeTeam} vs ${bet.awayTeam}. Se ha acreditado un beneficio neto de ${profit.toFixed(2)} USDT.`
              : `El encuentro ${bet.homeTeam} vs ${bet.awayTeam} finalizó sin beneficios adicionales (ROI 0%). Conforme a nuestro protocolo de seguridad, su capital total de ${bet.amount} USDT ha sido reembolsado íntegramente a su balance principal.`,
            timestamp: Timestamp.now(),
            read: false,
            amount: payout
          };

          const currentNotifications = userData.notifications || [];
          const updatedNotifications = [newNotification, ...currentNotifications].slice(0, 50);

          // Update User Balance and Notifications
          transaction.update(userRef, { 
            balance: newBalance,
            notifications: updatedNotifications
          });
          
          // Update Bet Status
          transaction.update(doc(db, 'bets', bet.id), {
            status: isWin ? 'won' : 'lost',
            finalScore: match.finalScore,
            payout: payout,
            profit: profit,
            resolvedAt: Timestamp.now()
          });
        });

        resolvedCount++;
      }
    }

    return { success: true, resolvedCount };
  } catch (error) {
    console.error('Bet Resolution Error:', error);
    throw error;
  }
}
