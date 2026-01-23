import { useHiLoTrainer } from '@hooks/useHiLoTrainer';

export const ResultPanel = () => {
  const { lastResult, isGameActive, timeLeft, score } = useHiLoTrainer();

  if (!isGameActive && timeLeft === 0) {
    return (
      <div className="rounded border-2 border-blue-200 bg-blue-50 px-4 py-3 text-center">
        <h3 className="text-lg font-bold text-blue-900">Game Over!</h3>
        <div className="mt-2 flex justify-center gap-6 text-lg font-semibold">
          <span className="text-green-600">Correct: {score.correct}</span>
          <span className="text-red-600">Incorrect: {score.incorrect}</span>
        </div>
        <p className="mt-2 text-sm text-blue-700">Press Start to try again!</p>
      </div>
    );
  }

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
