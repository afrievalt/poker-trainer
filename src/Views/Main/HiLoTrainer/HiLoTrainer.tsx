import { GuessForm } from './GuessForm';
import { HandDisplay } from './HandDisplay';
import { ResultPanel } from './ResultPanel';

export const HiLoTrainer = () => (
  <section className="rounded-md bg-white p-4 shadow-sm">
    <header className="mb-3">
      <h2 className="text-lg font-semibold text-gray-900">
        Omaha Best-Hand Trainer
      </h2>
      <p className="text-sm text-gray-600">
        Choose the best possible high and low hands that can be made with any 2
        hole cards.
      </p>
    </header>
    <HandDisplay />
    <GuessForm />
    <ResultPanel />
  </section>
);
