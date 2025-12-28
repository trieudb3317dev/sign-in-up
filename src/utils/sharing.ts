export function openGmailCompose(to: string | undefined, subject: string, body: string) {
  const base = 'https://mail.google.com/mail/';
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: to ?? '',
    su: subject,
    body,
    tf: '1',
  });
  const url = `${base}?${params.toString()}`;
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  return Boolean(win);
}

export function buildRecipeEmailBody(opts: {
  title: string;
  summary?: string;
  url?: string;
  mainIngredients?: string[];
  maxIngredients?: number;
  senderName?: string;
}) {
  const {
    title,
    summary = 'Check out this recipe.',
    url = '',
    mainIngredients = [],
    maxIngredients = 6,
    senderName,
  } = opts;

  const sampleIngredients = mainIngredients
    .slice(0, maxIngredients)
    .map((it) => `- ${it}`)
    .join('\n');
  const moreIngredientsNote =
    mainIngredients.length > maxIngredients ? `\n...and ${mainIngredients.length - maxIngredients} more` : '';

  const bodyLines = [
    `Hi,`,
    ``,
    `I found this recipe and thought you might like it:`,
    `${title}`,
    ``,
    `Summary:`,
    summary,
    ``,
    `Top ingredients:`,
    sampleIngredients + moreIngredientsNote,
    ``,
    `View the full recipe here: ${url}`,
    ``,
    `Enjoy!`,
    ``,
    `Shared by: ${senderName ?? 'A friend'} via Foodieland`,
  ];
  return bodyLines.join('\n');
}

// new: open Telegram share
export function openTelegramShare(url: string, text?: string) {
  try {
    const params = new URLSearchParams();
    if (url) params.set('url', url);
    if (text) params.set('text', text);
    const shareUrl = `https://t.me/share/url?${params.toString()}`;
    const win = window.open(shareUrl, '_blank', 'noopener,noreferrer');
    return Boolean(win);
  } catch {
    return false;
  }
}

// new: open Zalo share (basic web fallback)
export function openZaloShare(url: string, text?: string) {
  try {
    const params = new URLSearchParams();
    if (url) params.set('url', url);
    if (text) params.set('text', text);
    // Zalo web share variants; try zalo.me/share first
    const shareUrl = `https://zalo.me/share?${params.toString()}`;
    const win = window.open(shareUrl, '_blank', 'noopener,noreferrer');
    return Boolean(win);
  } catch {
    return false;
  }
}
