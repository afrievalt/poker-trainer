import { useHiLoTrainer } from '@hooks/useHiLoTrainer';

export const ResultPanel = () => {
  const { lastResult } = useHiLoTrainer();
  const summary = lastResult
    ? lastResult.isHighCorrect && lastResult.isLowCorrect
      ? 'Nice! Those are the best possible Omaha hands.'
      : 'Close — check the correct answers below.'
    : 'Make guesses to see the result.';

  return (
    <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
      <p className="text-gray-800">{summary}</p>
      {lastResult && (
        <div className="mt-2 text-gray-700">
          <div>Best high hand: {lastResult.actualHigh}</div>
          <div>Best low hand: {lastResult.actualLow}</div>
        </div>
      )}
    </div>
  );
};
