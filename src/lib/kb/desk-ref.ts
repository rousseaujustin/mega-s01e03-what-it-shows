const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function fnv1a(text: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

export function deskRef(signature: string): string {
  const text = signature.trim();
  const first = fnv1a(text, 0x811c9dc5);
  const second = fnv1a(text, 0x9e3779b9);
  let bits = (BigInt(first) << 8n) | BigInt(second & 0xff);
  let output = '';
  for (let i = 0; i < 8; i++) {
    output = ALPHABET[Number(bits & 31n)] + output;
    bits >>= 5n;
  }
  return `DR-${output.slice(0, 4)}-${output.slice(4)}`;
}
