import React, { useCallback, useRef } from 'react';
import { Card, RewardCard } from '../types';

interface SaveLoadProps {
  cards: Card[];
  rewardCards: RewardCard[];
  deck: Map<string, number>;
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  setRewardCards: React.Dispatch<React.SetStateAction<RewardCard[]>>;
  setDeck: React.Dispatch<React.SetStateAction<Map<string, number>>>;
}

const SaveLoad: React.FC<SaveLoadProps> = ({
  cards,
  rewardCards,
  deck,
  setCards,
  setRewardCards,
  setDeck,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveGame = useCallback(() => {
    const gameState = {
      cards,
      rewardCards,
      deck: Array.from(deck.entries()), // Convert Map to array for JSON serialization
      timestamp: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(gameState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `cb_cards_save_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Jogo salvo com sucesso! Verifique seus downloads.');
  }, [cards, rewardCards, deck]);

  const handleLoadGame = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert('Nenhum arquivo selecionado.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedState = JSON.parse(event.target?.result as string);

        // Basic validation for loaded data structure
        if (
          !loadedState ||
          !Array.isArray(loadedState.cards) ||
          !Array.isArray(loadedState.rewardCards) ||
          !Array.isArray(loadedState.deck)
        ) {
          throw new Error('Formato de arquivo de jogo inválido.');
        }

        setCards(loadedState.cards);
        setRewardCards(loadedState.rewardCards);
        setDeck(new Map(loadedState.deck)); // Convert array back to Map
        alert(`Jogo carregado com sucesso! Salvo em: ${loadedState.timestamp ? new Date(loadedState.timestamp).toLocaleString('pt-BR') : 'data desconhecida'}.`);
      } catch (error) {
        console.error('Erro ao carregar o jogo:', error);
        alert(`Erro ao carregar o jogo: ${error instanceof Error ? error.message : String(error)}. Verifique se o arquivo está correto.`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear the file input after loading
    }
  }, [setCards, setRewardCards, setDeck]);

  const handleClearAllData = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar TODOS os dados do jogo (cartas, recompensas, deck)? Esta ação é irreversível e removerá seus dados do navegador!')) {
      try {
        localStorage.removeItem('cb_cards_cards');
        localStorage.removeItem('cb_cards_reward_cards');
        localStorage.removeItem('cb_cards_deck');
        localStorage.removeItem('cb_cards_last_spawn_time'); // Also clear the game timer
        
        setCards([]);
        setRewardCards([]);
        setDeck(new Map());
        alert('Todos os dados do jogo foram limpos com sucesso!');
      } catch (error) {
        console.error('Erro ao limpar dados do localStorage:', error);
        alert('Erro ao tentar limpar os dados. Por favor, tente novamente.');
      }
    }
  }, [setCards, setRewardCards, setDeck]);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 min-h-[calc(100vh-80px)]">
      <h2 className="text-5xl font-extrabold text-white mb-10 text-center bg-gradient-to-r from-blue-300 to-cyan-400 text-transparent bg-clip-text">Salvar & Carregar Jogo</h2>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl">
        <div className="flex-1 p-6 bg-gray-800 rounded-xl shadow-xl border-2 border-gray-700 flex flex-col items-center justify-center">
          <h3 className="text-3xl font-bold text-blue-400 mb-6">Salvar Progresso</h3>
          <p className="text-gray-300 text-center mb-6 text-lg">
            Salve seu jogo para continuar de onde parou a qualquer momento. Um arquivo JSON será baixado.
          </p>
          <button
            onClick={handleSaveGame}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          >
            Salvar Jogo
          </button>
        </div>

        <div className="flex-1 p-6 bg-gray-800 rounded-xl shadow-xl border-2 border-gray-700 flex flex-col items-center justify-center">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6">Carregar Progresso</h3>
          <p className="text-gray-300 text-center mb-6 text-lg">
            Carregue um jogo salvo anteriormente selecionando seu arquivo JSON.
          </p>
          <input
            type="file"
            accept="application/json"
            onChange={handleLoadGame}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-cyan-500 file:text-white
              hover:file:bg-cyan-600 transition-colors duration-200
              aria-[invalid=true]:border-red-500"
            aria-label="Carregar arquivo de jogo"
          />
        </div>
      </div>
      <div className="mt-12 p-6 bg-gray-800 rounded-xl shadow-xl border-2 border-gray-700 w-full max-w-2xl flex flex-col items-center">
        <h3 className="text-3xl font-bold text-red-400 mb-6">Cuidado: Limpar Dados</h3>
        <p className="text-gray-300 text-center mb-6 text-lg">
          Esta opção irá remover permanentemente todas as suas cartas, recompensas e deck do navegador. Certifique-se de ter salvo seu jogo antes!
        </p>
        <button
          onClick={handleClearAllData}
          className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
          aria-label="Limpar todos os dados do jogo"
        >
          Limpar Todos os Dados
        </button>
      </div>
    </div>
  );
};

export default SaveLoad;