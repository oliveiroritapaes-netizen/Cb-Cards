import React, { useEffect, useRef } from 'react';
import { Card, RewardCard, Rarity } from '../types';

interface CardModalProps {
  card: Card | RewardCard;
  onClose: () => void;
  allRegularCards: Card[]; // Added to resolve required card names for RewardCards
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

const CardModal: React.FC<CardModalProps> = ({ card, onClose, allRegularCards }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside); // Use mousedown to capture clicks outside without interfering with focus changes

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Focus the modal when it opens for accessibility
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const getRequiredCardName = (cardId: string) => {
    return allRegularCards.find((c) => c.id === cardId)?.name || 'Carta Desconhecida';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      tabIndex={-1} // Make the modal focusable
    >
      <div
        ref={modalRef}
        className="relative bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm w-full outline-none" // outline-none to remove default focus outline
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl font-bold transition-colors duration-200"
          aria-label="Fechar"
        >
          &times;
        </button>
        <h2 id="card-modal-title" className="sr-only">Detalhes da Carta: {card.name}</h2> {/* Screen reader only title */}

        <div className="flex flex-col items-center">
          <img
            src={card.imageUrl || `https://via.placeholder.com/200x300/1f2937/d1d5db?text=Sem+Imagem`}
            alt={card.name}
            className="w-56 h-72 rounded-lg mb-4 object-cover border-2 border-gray-700 shadow-md"
            onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/200x300/1f2937/d1d5db?text=Imagem+Nao+Carregada`; }}
          />
          <h3 className="text-3xl font-bold text-white mb-2 text-center break-words max-w-full">{card.name}</h3>
          {isRegularCard(card) && (
            <p className={`text-xl font-semibold ${getRarityColor(card.rarity)} mb-3`}>
              {card.rarity}
            </p>
          )}
          <p className="text-gray-300 text-center text-md leading-relaxed mb-4 max-h-40 overflow-y-auto custom-scrollbar">
            {card.description}
          </p>

          {/* If it's a reward card, display requirements (optional, could be complex) */}
          {!isRegularCard(card) && card.requiredCards && card.requiredCards.length > 0 && (
            <div className="w-full text-left mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-lg font-bold text-purple-300 mb-2 border-b border-gray-600 pb-1">Necessário para Resgatar:</h4>
              <ul className="text-sm text-gray-400">
                {card.requiredCards.map((req, index) => (
                  <li key={index} className="flex justify-between items-center py-1">
                    <span>{getRequiredCardName(req.cardId)}</span>
                    <span className="font-bold">x{req.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardModal;