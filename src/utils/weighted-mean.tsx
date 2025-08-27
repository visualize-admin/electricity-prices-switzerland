export const weightedMean = <T,>(
  data: T[],
  valueFn: (d: T) => number,
  weightFn: (d: T) => number
) => {
  const totalWeight = data.reduce((acc, d) => acc + weightFn(d), 0);
  if (totalWeight === 0) return 0;

  return (
    data.reduce((acc, d) => acc + weightFn(d) * (valueFn(d) ?? 0), 0) /
    totalWeight
  );
};
