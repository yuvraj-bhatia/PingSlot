// apmac-ui/src/lib/crypto-polyfill.ts

function fallbackRandomUUID(): `${string}-${string}-${string}-${string}-${string}` {
  // Non-crypto-secure v4-style UUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  }) as `${string}-${string}-${string}-${string}-${string}`;
}

// Only run in browser
if (typeof window !== "undefined") {
  const cryptoRef = window.crypto as Crypto & {
    randomUUID?: () => string;
  };

  if (cryptoRef && typeof cryptoRef.randomUUID !== "function") {
    console.warn("[polyfill] crypto.randomUUID not found; installing fallback");
    cryptoRef.randomUUID = fallbackRandomUUID;
  }
}
