import { useHiLoTrainer } from '@hooks/useHiLoTrainer';

export const GameControls = () => {
  const {
    isGameActive,
    timeLeft,
    initialTime,
    score,
    onStartGame,
    onSetInitialTime,
  } = useHiLoTrainer();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-4">
      <div className="flex items-center gap-4">
        {!isGameActive ? (
          <div className="flex items-center gap-2">
            <label
              htmlFor="timer"
              className="text-sm font-medium text-gray-700"
            >
              Timer (min):
            </label>
            <input
              id="timer"
              type="number"
              min="1"
              max="60"
              value={initialTime}
              onChange={(e) => onSetInitialTime(Number(e.target.value))}
              className="w-16 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => onStartGame(initialTime)}
              className="rounded bg-blue-600 px-4 py-1 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Start
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="font-mono text-2xl font-bold text-blue-600">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="flex gap-3 text-sm font-medium">
              <span className="text-green-600">Correct: {score.correct}</span>
              <span className="text-red-600">Incorrect: {score.incorrect}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
