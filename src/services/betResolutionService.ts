import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bet, Match } from '../types';

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
          
          const currentBalance = userSnap.data().balance || 0;
          const newBalance = currentBalance + payout;
          
          // Update User Balance
          transaction.update(userRef, { balance: newBalance });
          
          // Update Bet Status
          transaction.update(doc(db, 'bets', bet.id), {
            status: isWin ? 'won' : 'lost',
            finalScore: match.finalScore,
            payout: payout,
            profit: profit,
            resolvedAt: new Date()
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
