import React from 'react';
import { Card, RewardCard } from '../types';
import RewardCardDisplay from './RewardCardDisplay';

interface RewardListProps {
  rewardCards: RewardCard[];
  allCards: Card[]; // Only normal cards are requirements for reward cards
  deck: Map<string, number>;
  onRedeem: (rewardCardId: string) => void;
  onCardClick: (card: RewardCard) => void; // New prop
}

const RewardList: React.FC<RewardListProps> = ({ rewardCards, allCards, deck, onRedeem, onCardClick }) => {
  return (
    <div className="p-6 bg-gray-900 min-h-[calc(100vh-80px)]">
      <h2 className="text-5xl font-extrabold text-white mb-10 text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">Recompensas</h2>

      {rewardCards.length === 0 ? (
        <p className="text-gray-400 text-xl text-center mt-10 p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700">Nenhuma carta de recompensa criada ainda.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {rewardCards.map((reward) => (
            <RewardCardDisplay
              key={reward.id}
              rewardCard={reward}
              allCards={allCards}
              currentDeck={deck}
              onRedeem={onRedeem}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardList;
