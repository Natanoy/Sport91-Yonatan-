import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTeamLogo(teamName: string) {
  const mapping: { [key: string]: string } = {
    'Real Madrid': '541',
    'Barcelona': '529',
    'Man City': '50',
    'Liverpool': '40',
    'Bayern Munich': '157',
    'PSG': '85',
    'Chelsea': '49',
    'Arsenal': '42',
    'Juventus': '496',
    'Inter Milan': '505',
    'AC Milan': '489',
    'Dortmund': '165',
    'Atletico Madrid': '530',
    'Spurs': '47',
    'Newcastle': '34',
    'LASK': '449',
    'Rapid Wien': '450',
    'Almeria': '720',
    'CD Mirandes': '734'
  };

  const id = mapping[teamName];
  if (id) {
    return `https://media.api-sports.io/football/teams/${id}.png`;
  }
  // Fallback to a placeholder with initials if not found
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=1e2128&color=00ff88&bold=true`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function calculatePotentialProfit(amount: number, roi: number) {
  return amount * (roi / 100)
}
