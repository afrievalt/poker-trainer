import { useHiLoTrainer } from '@hooks/useHiLoTrainer';
import { useEffect, useState } from 'react';

export const FeedbackOverlay = () => {
  const { lastResult, clearResult } = useHiLoTrainer();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lastResult) {
      const isCorrect = lastResult.isCorrect;

      // When correct, show the next hand (already handled by useHiLoTrainer)
      // then show the green check after a small delay.
      const showTimer = setTimeout(
        () => {
          setShow(true);
        },
        isCorrect ? 100 : 0,
      );

      const hideTimer = setTimeout(
        () => {
          setShow(false);
          clearResult();
        },
        isCorrect ? 900 : 800,
      );

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [lastResult, clearResult]);

  if (!show || !lastResult) return null;

  const isCorrect = lastResult.isCorrect;

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
