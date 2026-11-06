export const createShareUrl = (families: string[]): string => {
  const bytes = new TextEncoder().encode(JSON.stringify(families));
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('data', btoa(binary));
  return url.toString();
};

export const decodeSharedFamilies = (encoded: string): string[] => {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));

  if (!Array.isArray(parsed)) return [];

  return [...new Set(parsed.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean))];
};