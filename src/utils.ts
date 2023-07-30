export function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

export function rand(a = 0, b = 0) {
  return Math.random() * (b - a) + a;
}

export function generateRandomNumbersWithSum(
  n,
  sum = 1,
  weights: number[] = [],
  restrictions: number[][] = []
): number[] {
  while (true) {
    const randoms = [0, 1];
    for (let i = 0; i < n - 1; i++) randoms.push(Math.random());
    randoms.sort();
    const diffs: number[] = [];
    for (let i = 0; i < n; i++) diffs[i] = randoms[i + 1] - randoms[i];

    //  naive restrictions implementation, can loop endlessly with certain parameters
    if (
      diffs.some((r, i) => {
        if (!restrictions[i]) return false;
        const [min, max] = restrictions[i];
        if (r < min || r >= max) return true;
        return false;
      })
    ) {
      continue;
    }

    return diffs.map((r, i) => (r * sum) / (weights[i] || 1));
  }
}
