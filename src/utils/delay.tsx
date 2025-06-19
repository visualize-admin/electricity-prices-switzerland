export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
export const frame = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));
