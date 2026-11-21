import React from 'react';

interface TextListProps {
  title: string;
  lines: string[];
}

export const TextList: React.FC<TextListProps> = ({ title, lines }) => (
  <section>
    <h3 className="mb-1 font-bold text-gray-900">{title}</h3>
    <ol className="text-sm text-gray-800">
      {lines.map((line, lineNumber) => (
        <li key={`${lineNumber}-${line}`}>{line}</li>
      ))}
    </ol>
  </section>
);
