/** Countdown helpers shared by the auction table and card views. */

export function getCountdown(endTime: Date | string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'ENDED';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function isEndingWithin3Hours(endTime: Date | string): boolean {
  const diff = new Date(endTime).getTime() - Date.now();
  return diff > 0 && diff <= 3 * 60 * 60 * 1000;
}

export function isAuctionEnded(endTime: Date | string): boolean {
  return new Date(endTime).getTime() <= Date.now();
}
