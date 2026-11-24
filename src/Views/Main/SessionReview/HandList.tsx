import React from 'react';

import { HandListItems } from './HandListItems';

export const HandList: React.FC = () => (
  <section className="flex flex-col gap-4 rounded-lg bg-white p-3 shadow">
    <HandListItems
      title="Starred"
      emptyMessage="Star a hand to come back and analyze it."
      isStarredOnly
    />
    <HandListItems
      title="Hands"
      emptyMessage="Play a hand to see it here."
      isStarredOnly={false}
    />
  </section>
);
