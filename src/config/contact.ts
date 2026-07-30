export const AXIOM_WEBSITE = "https://axiomsemantics.com.br";

// Kept out of the rendered HTML and assembled only after a user interaction.
// This discourages basic email harvesters; determined JavaScript-aware crawlers
// can still recover any address required by a fully client-side mailto workflow.
const CONTACT_EMAIL_CODE_POINTS = [
  97, 120, 105, 111, 109, 115, 101, 109, 97, 110, 116, 105, 99, 115,
  111, 102, 116, 119, 97, 114, 101, 64, 103, 109, 97, 105, 108, 46,
  99, 111, 109,
] as const;

export function getContactEmail() {
  return String.fromCharCode(...CONTACT_EMAIL_CODE_POINTS);
}

export function createContactMailto(subject: string, body: string) {
  return `mailto:${getContactEmail()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
