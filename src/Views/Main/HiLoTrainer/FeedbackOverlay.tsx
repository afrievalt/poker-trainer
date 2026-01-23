import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import { useEffect, useState } from 'react';

export const FeedbackOverlay = () => {
  const { lastResult, resetGuesses } = useHiLoTrainer();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lastResult) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (!lastResult.isHighCorrect || !lastResult.isLowCorrect) {
          resetGuesses();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lastResult, resetGuesses]);

  if (!show || !lastResult) return null;

  const isCorrect = lastResult.isHighCorrect && lastResult.isLowCorrect;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="animate-flash text-9xl font-bold">
        {isCorrect ? (
          <span className="text-green-500">✓</span>
        ) : (
          <span className="text-red-500">✕</span>
        )}
      </div>
    </div>
  );
};
