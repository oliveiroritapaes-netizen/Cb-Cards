import React from 'react';
import { Card, RewardCard, Rarity } from '../types';

interface CardDisplayProps {
  card: Card | RewardCard;
  className?: string;
  showQuantity?: number;
  onCardClick?: (card: Card | RewardCard) => void; // New prop
}

function isRegularCard(card: Card | RewardCard): card is Card {
  return (card as Card).rarity !== undefined;
}

const getRarityColor = (rarity: Rarity) => {
  switch (rarity) {
    case Rarity.COMMON:
      return 'text-gray-400';
    case Rarity.UNCOMMON:
      return 'text-green-400';
    case Rarity.RARE:
      return 'text-blue-400';
    case Rarity.EPIC:
      return 'text-purple-400';
    case Rarity.LEGENDARY:
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
};

const CardDisplay: React.FC<CardDisplayProps> = ({ card, className, showQuantity, onCardClick }) => {
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  return (
    <div
      className={`flex flex-col items-center p-5 bg-gray-800 rounded-xl shadow-xl border-2 border-gray-700 hover:border-blue-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${onCardClick ? 'cursor-pointer' : ''} ${className || ''}`}
      onClick={handleClick}
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      aria-label={onCardClick ? `Ver detalhes de ${card.name}` : undefined}
    >
      <img
        src={card.imageUrl || `https://via.placeholder.com/200x300/1f2937/d1d5db?text=Sem+Imagem`}
        alt={card.name}
        className="w-40 h-52 rounded-lg mb-4 object-cover border border-gray-600 shadow-md"
        onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/200x300/1f2937/d1d5db?text=Imagem+Nao+Carregada`; }}
      />
      <h3 className="text-xl font-bold text-white mb-2 text-center break-words max-w-full">{card.name}</h3>
      {isRegularCard(card) && (
        <p className={`text-md font-semibold ${getRarityColor(card.rarity)} mb-3`}>
          {card.rarity}
        </p>
      )}
      <p className="text-gray-300 text-center text-sm flex-grow max-h-24 overflow-hidden leading-tight mb-3">
        {card.description}
      </p>
      {showQuantity !== undefined && showQuantity > 0 && (
        <p className="mt-2 text-xl font-extrabold text-blue-400 bg-gray-700 px-3 py-1 rounded-full border border-blue-600">Qtd: {showQuantity}</p>
      )}
    </div>
  );
};

export default CardDisplay;
