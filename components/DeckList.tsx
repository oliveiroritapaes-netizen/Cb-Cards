import React from 'react';
import { Card, RewardCard } from '../types';
import CardDisplay from './CardDisplay';

interface DeckListProps {
  deck: Map<string, number>;
  allCards: (Card | RewardCard)[]; // Can contain both regular Cards and RewardCards
  onCardClick: (card: Card | RewardCard) => void; // New prop
}

const DeckList: React.FC<DeckListProps> = ({ deck, allCards, onCardClick }) => {
  const deckItems = Array.from(deck.entries())
    .map(([cardId, quantity]) => {
      const card = allCards.find((c) => c.id === cardId);
      return card ? { card, quantity } : null;
    })
    .filter(Boolean); // Filter out nulls if a card ID doesn't match any in allCards

  return (
    <div className="p-6 bg-gray-900 min-h-[calc(100vh-80px)]">
      <h2 className="text-5xl font-extrabold text-white mb-10 text-center bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">Meu Deck</h2>

      {deckItems.length === 0 ? (
        <p className="text-gray-400 text-xl text-center mt-10 p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700">Seu deck está vazio. Jogue para coletar cartas!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {deckItems.map((item) => (
            <CardDisplay key={item!.card.id} card={item!.card} showQuantity={item!.quantity} onCardClick={onCardClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckList;
