export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'baru saja';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit yang lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam yang lalu`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} hari yang lalu`;
  
  return formatDate(timestamp);
}

export function extractKanji(word: string): string {
  return word.replace(/[あ-んア-ンー]/g, '').trim();
}

export function extractReading(word: string): string {
  const match = word.match(/[（(]([^）)]+)[）)]/);
  return match ? match[1] : '';
}
