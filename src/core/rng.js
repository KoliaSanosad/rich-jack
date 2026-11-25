// Честный генератор случайных чисел: только crypto.getRandomValues.
// Результат не зависит от баланса, покупок или времени.
const buf = new Uint32Array(256);
let pos = buf.length;

function nextUint32() {
  if (pos >= buf.length) {
    globalThis.crypto.getRandomValues(buf);
    pos = 0;
  }
  return buf[pos++];
}

/** Случайное целое 0..n-1 без смещения (rejection sampling). */
export function randomInt(n) {
  const limit = Math.floor(0x100000000 / n) * n;
  let x;
  do x = nextUint32(); while (x >= limit);
  return x % n;
}

/** Выбор индекса по весам. */
export function weightedIndex(weights, total) {
  let r = randomInt(total);
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}
