import { CardFace } from '@components/CardFace';
import type { Card } from '@poker/evaluation/cards';
import { getCardCode } from '@poker/evaluation/cards';
import React from 'react';

interface CardRowProps {
  title: string;
  cards: Card[];
}

export const CardRow: React.FC<CardRowProps> = ({ title, cards }) => (
  <div>
    <h3 className="mb-1 text-sm font-semibold text-gray-700">{title}</h3>
    <div className="flex gap-1">
      {cards.map((card) => (
        <CardFace key={getCardCode(card)} card={card} />
      ))}
    </div>
  </div>
);
