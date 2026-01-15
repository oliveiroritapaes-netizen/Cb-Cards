import React, { useState } from 'react';
import { Card, RewardCard, RequiredCard } from '../types';
import { fileToBase64 } from '../utils/imageHelpers';

interface RewardCardFormProps {
  allCards: Card[];
  onAddRewardCard: (rewardCard: Omit<RewardCard, 'id'>) => void;
}

const RewardCardForm: React.FC<RewardCardFormProps> = ({ allCards, onAddRewardCard }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requiredCards, setRequiredCards] = useState<RequiredCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [selectedCardQuantity, setSelectedCardQuantity] = useState<number>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);

  React.useEffect(() => {
    if (allCards.length > 0 && !selectedCardId) {
      setSelectedCardId(allCards[0].id);
    } else if (allCards.length === 0) {
        setSelectedCardId('');
    }
  }, [allCards, selectedCardId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      try {
        const base64 = await fileToBase64(file);
        setImageUrl(base64);
      } catch (error) {
        console.error('Erro ao converter imagem para Base64:', error);
        setImageUrl('');
        setImageFile(null);
        alert('Falha ao carregar a imagem. Tente novamente.');
      }
    } else {
      setImageUrl('');
      setImageFile(null);
    }
  };

  const handleAddRequiredCard = () => {
    if (selectedCardId && selectedCardQuantity > 0) {
      const existingReqIndex = requiredCards.findIndex(
        (req) => req.cardId === selectedCardId,
      );

      if (existingReqIndex > -1) {
        const updatedRequiredCards = [...requiredCards];
        updatedRequiredCards[existingReqIndex].quantity += selectedCardQuantity;
        setRequiredCards(updatedRequiredCards);
      } else {
        setRequiredCards([
          ...requiredCards,
          { cardId: selectedCardId, quantity: selectedCardQuantity },
        ]);
      }
      setSelectedCardQuantity(1);
    }
  };

  const handleRemoveRequiredCard = (cardIdToRemove: string) => {
    setRequiredCards(requiredCards.filter((req) => req.cardId !== cardIdToRemove));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !description || requiredCards.length === 0) {
      alert('Nome, descrição e cartas necessárias são obrigatórios!');
      return;
    }
    if (!imageUrl) {
        alert('Por favor, faça upload de uma imagem para a carta de recompensa.');
        return;
    }
    onAddRewardCard({ imageUrl, name, description, requiredCards });
    setImageUrl('');
    setName('');
    setDescription('');
    setRequiredCards([]);
    setSelectedCardId(allCards.length > 0 ? allCards[0].id : '');
    setSelectedCardQuantity(1);
    setImageFile(null);
    (document.getElementById('rewardImageUpload') as HTMLInputElement).value = ''; // Clear file input
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-xl shadow-2xl max-w-lg mx-auto border border-gray-700">
      <h2 className="text-4xl font-extrabold text-white mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">Criar Carta de Recompensa</h2>

      <div className="mb-6">
        <label htmlFor="rewardImageUpload" className="block text-gray-300 text-sm font-bold mb-2 cursor-pointer">
          Upload da Imagem da Recompensa:
          <span className="ml-2 text-purple-400 hover:text-purple-300 transition-colors duration-200">Escolher Arquivo</span>
        </label>
        <input
          type="file"
          id="rewardImageUpload"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-500 file:text-white
            hover:file:bg-purple-600 transition-colors duration-200"
          required
        />
        {imageUrl && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm mb-2">Prévia da Imagem:</p>
            <img src={imageUrl} alt="Prévia da Recompensa" className="max-w-[150px] max-h-[200px] object-cover rounded-md border border-gray-600 mx-auto shadow-md" />
          </div>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
          Nome da Carta de Recompensa:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
          placeholder="Nome da recompensa"
          required
        />
      </div>

      <div className="mb-8">
        <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">
          Descrição:
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 resize-none"
          placeholder="Descreva a carta de recompensa..."
          required
        ></textarea>
      </div>

      <div className="mb-8 p-4 bg-gray-700 rounded-lg border border-gray-600">
        <label className="block text-gray-300 text-sm font-bold mb-3">
          Cartas Necessárias para Desbloquear:
        </label>
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
          <select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
            className="shadow border border-gray-600 rounded-lg py-2 px-3 bg-gray-600 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 flex-grow disabled:bg-gray-700 disabled:text-gray-500 transition-colors duration-200"
            disabled={allCards.length === 0}
            aria-label="Selecionar carta necessária"
          >
            {allCards.length === 0 ? (
              <option value="">Crie cartas básicas primeiro</option>
            ) : (
              allCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} ({card.rarity})
                </option>
              ))
            )}
          </select>
          <input
            type="number"
            value={selectedCardQuantity}
            onChange={(e) => setSelectedCardQuantity(Math.max(1, parseInt(e.target.value)))}
            min="1"
            className="shadow appearance-none border border-gray-600 rounded-lg py-2 px-3 bg-gray-600 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 w-24 text-center disabled:bg-gray-700 disabled:text-gray-500 transition-colors duration-200"
            disabled={allCards.length === 0}
            aria-label="Quantidade necessária"
          />
          <button
            type="button"
            onClick={handleAddRequiredCard}
            disabled={!selectedCardId || allCards.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:opacity-70 disabled:hover:scale-100"
            aria-label="Adicionar carta necessária"
          >
            Adicionar
          </button>
        </div>

        <ul className="bg-gray-800 p-3 rounded-md max-h-40 overflow-y-auto border border-gray-600">
          {requiredCards.length === 0 ? (
            <li className="text-gray-400 text-center py-2">Nenhuma carta necessária adicionada ainda.</li>
          ) : (
            requiredCards.map((req) => (
              <li key={req.cardId} className="flex justify-between items-center py-2 px-2 border-b border-gray-700 last:border-b-0">
                <span className="text-gray-200 text-base">
                  {allCards.find((card) => card.id === req.cardId)?.name || 'Carta Desconhecida'} (x{req.quantity})
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveRequiredCard(req.cardId)}
                  className="text-red-400 hover:text-red-500 text-sm font-bold px-3 py-1 rounded-md transition-colors duration-200"
                  aria-label={`Remover ${allCards.find((card) => card.id === req.cardId)?.name}`}
                >
                  Remover
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:bg-gray-500 disabled:opacity-70 disabled:hover:scale-100"
        disabled={requiredCards.length === 0 || !imageUrl || !name || !description}
      >
        Adicionar Carta de Recompensa
      </button>
    </form>
  );
};

export default RewardCardForm;
