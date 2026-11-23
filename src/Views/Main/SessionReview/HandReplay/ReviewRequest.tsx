import { buildReviewRequest } from '@poker/coaching/reviewRequest';
import { useAppSelector } from '@store/hooks';
import { selectReviewedHand } from '@store/slices/handHistorySelectors';
import React from 'react';

export const ReviewRequest: React.FC = () => {
  const hand = useAppSelector(selectReviewedHand);
  const request = hand ? buildReviewRequest(hand) : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(request).catch((error: unknown) => {
      console.error('Failed to copy the review request', error);
    });
  };

  return (
    <section className={hand ? 'flex flex-col gap-2' : 'hidden'}>
      <h3 className="font-bold text-gray-900">Review request</h3>
      <p className="text-sm text-gray-800">
        Paste this into a chat. It includes your note and what you could see.
        The showdown is labeled as hindsight.
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="w-fit rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Copy review request
      </button>
      <pre className="max-h-48 overflow-auto rounded-md border-2 border-gray-900 bg-white p-2 text-sm whitespace-pre-wrap text-gray-900">
        {request}
      </pre>
    </section>
  );
};
