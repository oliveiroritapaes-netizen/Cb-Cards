import React from 'react';
import { RewardCard, Card, RequiredCard } from '../types';

interface RewardCardDisplayProps {
  rewardCard: RewardCard;
  allCards: Card[]; // Only regular cards are requirements
  currentDeck: Map<string, number>;
  onRedeem?: (rewardCardId: string) => void;
  onCardClick?: (card: RewardCard) => void; // New prop
}

const RewardCardDisplay: React.FC<RewardCardDisplayProps> = ({
  rewardCard,
  allCards,
  currentDeck,
  onRedeem,
  onCardClick, // Destructure new prop
}) => {
  const getCardName = (cardId: string) => {
    return allCards.find((card) => card.id === cardId)?.name || 'Carta Desconhecida';
  };

  const canRedeem = rewardCard.requiredCards.every((req) => {
    const deckQuantity = currentDeck.get(req.cardId) || 0;
    return deckQuantity >= req.quantity;
  });

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(rewardCard);
    }
  };

  const handleRedeemClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card click event from firing when clicking the redeem button
    if (onRedeem) {
      onRedeem(rewardCard.id);
    }
  };

  return (
    <div
      className={`flex flex-col items-center p-5 bg-gray-800 rounded-xl shadow-xl border-2 border-gray-700 hover:border-purple-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${onCardClick ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      aria-label={onCardClick ? `Ver detalhes de ${rewardCard.name}` : undefined}
    >
      <img
        src={rewardCard.imageUrl || `https://via.placeholder.com/200x300/1f2937/d1d5db?text=Sem+Imagem`}
        alt={rewardCard.name}
        className="w-40 h-52 rounded-lg mb-4 object-cover border border-gray-600 shadow-md"
        onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/200x300/1f2937/d1d5db?text=Imagem+Nao+Carregada`; }}
      />
      <h3 className="text-xl font-bold text-white mb-2 text-center break-words max-w-full">{rewardCard.name}</h3>
      <p className="text-gray-300 text-center text-sm flex-grow max-h-24 overflow-hidden leading-tight mb-4">
        {rewardCard.description}
      </p>

      <div className="w-full text-left mt-2 p-3 bg-gray-700 rounded-lg border border-gray-600">
        <h4 className="text-lg font-bold text-purple-300 mb-2 border-b border-gray-500 pb-1">Cartas Necessárias:</h4>
        <ul className="text-sm text-gray-400">
          {rewardCard.requiredCards.map((req, index) => {
            const deckQuantity = currentDeck.get(req.cardId) || 0;
            const hasEnough = deckQuantity >= req.quantity;
            return (
              <li key={index} className={`flex justify-between items-center py-1.5 ${hasEnough ? 'text-green-400' : 'text-red-400'} font-medium`}>
                <span>{getCardName(req.cardId)}</span>
                <span className="font-bold">{deckQuantity} / {req.quantity}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {onRedeem && (
        <button
          onClick={handleRedeemClick}
          disabled={!canRedeem}
          className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-bold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
            canRedeem
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50'
              : 'bg-gray-600 cursor-not-allowed opacity-60'
          }`}
        >
          Resgatar Recompensa
        </button>
      )}
    </div>
  );
};

export default RewardCardDisplay;
