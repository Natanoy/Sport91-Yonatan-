export interface FootballMatch {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean;
    };
  };
  goals: {
    home: number;
    away: number;
  };
}

export async function fetchLiveMatches(): Promise<FootballMatch[]> {
  try {
    const response = await fetch('/api/football/fixtures?live=all');
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return [];
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but received non-JSON response:', text.slice(0, 100));
      return [];
    }

    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

export async function fetchMatchesByDate(date: string): Promise<FootballMatch[]> {
  try {
    const response = await fetch(`/api/football/fixtures?date=${date}`);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return [];
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but received non-JSON response:', text.slice(0, 100));
      return [];
    }

    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error('Error fetching matches by date:', error);
    return [];
  }
}
