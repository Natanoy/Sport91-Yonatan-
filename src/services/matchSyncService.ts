import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { fetchLiveMatches, fetchMatchesByDate } from './footballApi';
import { Match } from '../types';

export async function syncFootballMatches() {
  // 1. Check if we synced recently (within last 6 hours) to save API calls
  const statusRef = doc(db, 'system', 'match_sync');
  const statusSnap = await getDoc(statusRef);
  
  if (statusSnap.exists()) {
    const lastSync = statusSnap.data().lastSync?.toDate();
    if (lastSync && (new Date().getTime() - lastSync.getTime()) < 6 * 60 * 60 * 1000) {
      console.log('Sync skipped: matches were updated recently.');
      return { success: true, message: 'Recent sync skipped' };
    }
  }

  try {
    const today = new Date();
    const datesToSync = [];
    for (let i = 0; i < 3; i++) { // Sync next 3 days to keep it efficient but comprehensive
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      datesToSync.push(d.toISOString().split('T')[0]);
    }

    const liveMatches = await fetchLiveMatches();
    let allApiMatches = [...liveMatches];

    const majorLeagueIds = [39, 140, 135, 78, 61, 2, 3]; // Premier, La Liga, Serie A, Bundes, Ligue 1, UCL, UEL

    for (const date of datesToSync) {
       const daily = await fetchMatchesByDate(date);
       // Prioritize major leagues from each day
       const majorOnes = daily.filter(m => majorLeagueIds.includes(m.league.id));
       const others = daily.filter(m => !majorLeagueIds.includes(m.league.id));
       
       allApiMatches = [...allApiMatches, ...majorOnes, ...others.slice(0, 15)]; 
    }
    
    // Sort and unique
    const uniqueMatches = Array.from(new Map(allApiMatches.map(m => [m.fixture.id, m])).values());
    const finalMatches = uniqueMatches
      .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
      .slice(0, 60); 

    if (finalMatches.length === 0) {
      return { success: false, message: 'No matches found in API' };
    }

    for (const apiMatch of finalMatches) {
      const matchId = `api_${apiMatch.fixture.id}`;
      
      // Generate consistent but "random-looking" odds for anti-score based on user-provided scores
      const seed = apiMatch.fixture.id;
      const antiScoreOdds = {
        "0-0": (2.5 + (seed % 20) / 100),
        "0-1": (1.2 + (seed % 20) / 100),
        "0-2": (0.6 + (seed % 20) / 100),
        "0-3": (0.9 + (seed % 20) / 100),
        "0-4": (0.2 + (seed % 20) / 100),
        "1-0": (0.4 + (seed % 20) / 100),
        "1-1": (2.0 + (seed % 20) / 100),
        "1-2": (0.8 + (seed % 20) / 100),
        "1-3": (0.5 + (seed % 20) / 100),
        "2-0": (2.0 + (seed % 20) / 100),
        "2-1": (0.7 + (seed % 20) / 100),
        "2-2": (0.8 + (seed % 20) / 100),
        "2-3": (0.2 + (seed % 20) / 100),
        "3-0": (0.2 + (seed % 20) / 100),
        "3-1": (0.5 + (seed % 20) / 100),
        "3-2": (0.6 + (seed % 20) / 100),
        "3-3": (0.2 + (seed % 20) / 100),
        "4-0": (0.6 + (seed % 20) / 100),
        "4-4": (0.4 + (seed % 10) / 100),
        "otro": 0.2,
      };

      // Clean up values to be numbers with 2 decimals
      Object.keys(antiScoreOdds).forEach(key => {
        if (key !== 'otro') {
          (antiScoreOdds as any)[key] = parseFloat((antiScoreOdds as any)[key].toFixed(2));
        }
      });

      const matchData: Match = {
        id: matchId,
        homeTeam: apiMatch.teams.home.name,
        awayTeam: apiMatch.teams.away.name,
        homeLogo: apiMatch.teams.home.logo,
        awayLogo: apiMatch.teams.away.logo,
        startTime: Timestamp.fromDate(new Date(apiMatch.fixture.date)),
        status: apiMatch.fixture.status.short === 'FT' ? 'finished' : (apiMatch.fixture.status.short === 'NS' ? 'upcoming' : 'live'),
        league: apiMatch.league.name,
        leagueLogo: apiMatch.league.logo,
        isReal: true,
        finalScore: apiMatch.goals.home !== null ? `${apiMatch.goals.home}-${apiMatch.goals.away}` : undefined,
        antiScoreOdds
      };

      await setDoc(doc(db, 'matches', matchId), matchData, { merge: true });
    }

    // Update last sync status
    await setDoc(statusRef, {
      lastSync: serverTimestamp(),
      matchCount: allApiMatches.length
    });

    return { success: true, count: allApiMatches.length };
  } catch (error) {
    console.error('Match Sync Error:', error);
    throw error;
  }
}
