import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Rarity } from '../types';
import { RARITY_CHANCES, CARD_SPAWN_INTERVAL_MS } from '../constants';
import CardDisplay from './CardDisplay';

interface GameAreaProps {
  allCards: Card[];
  onPickCard: (card: Card) => void;
}

const GameArea: React.FC<GameAreaProps> = ({ allCards, onPickCard }) => {
  const [currentRandomCard, setCurrentRandomCard] = useState<Card | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0); // in seconds
  const intervalRef = useRef<number | null>(null);

  // Helper to update localStorage and the ref
  const setLastSpawnTime = useCallback((timestamp: number) => {
    try {
      localStorage.setItem('cb_cards_last_spawn_time', timestamp.toString());
    } catch (error) {
      console.error('Erro ao salvar o timestamp do spawn no localStorage:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('Aviso: Espaço de armazenamento do navegador esgotado. O timer pode não persistir corretamente.');
      } else {
        alert('Erro ao salvar dados do timer. Por favor, tente novamente.');
      }
    }
  }, []);

  // Picks a card based on rarity chances
  const pickRaritySpecificCard = useCallback(() => {
    if (allCards.length === 0) {
      return null;
    }

    let selectedRarity: Rarity | null = null;
    let rand = Math.random();

    let cumulativeChance = 0;
    for (const { rarity, chance } of RARITY_CHANCES) {
      cumulativeChance += chance;
      if (rand < cumulativeChance) {
        selectedRarity = rarity;
        break;
      }
    }

    let potentialCards: Card[] = [];
    if (selectedRarity) {
      potentialCards = allCards.filter((card) => card.rarity === selectedRarity);
    }

    // Fallback: if no cards of selected rarity, pick any card
    if (potentialCards.length === 0 && allCards.length > 0) {
      potentialCards = allCards;
    }

    if (potentialCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * potentialCards.length);
      return potentialCards[randomIndex];
    } else {
      return null;
    }
  }, [allCards]);

  // Function to spawn a new card (only sets state, does not update timestamp)
  const spawnNewCard = useCallback(() => {
    const card = pickRaritySpecificCard();
    setCurrentRandomCard(card);
  }, [pickRaritySpecificCard]);

  // Function to manage the timer countdown
  const startTimer = useCallback((initialTimeInSeconds: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setRemainingTime(Math.max(0, initialTimeInSeconds)); // Ensure time doesn't go negative

    intervalRef.current = window.setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) { // Timer has run out
          spawnNewCard(); // Spawn a new card
          setLastSpawnTime(Date.now()); // Update last spawn time for the *next* cycle
          return CARD_SPAWN_INTERVAL_MS / 1000; // Reset for the next cycle with full duration
        }
        return prev - 1;
      });
    }, 1000);
  }, [spawnNewCard, setLastSpawnTime]);

  // Effect for initial load and visibility changes
  useEffect(() => {
    const initializeTimer = () => {
      // If there are no cards to pick, clear everything
      if (allCards.length === 0) {
        setCurrentRandomCard(null);
        setRemainingTime(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setLastSpawnTime(Date.now()); // Reset spawn time in storage too, for when cards exist
        return;
      }

      const storedLastSpawnTime = localStorage.getItem('cb_cards_last_spawn_time');
      let lastSpawnTimestamp = storedLastSpawnTime ? parseInt(storedLastSpawnTime) : 0;

      const currentTime = Date.now();

      // If no last spawn time (first run) or it's very old, initialize it
      if (lastSpawnTimestamp === 0 || (currentTime - lastSpawnTimestamp) > (CARD_SPAWN_INTERVAL_MS * 2)) {
          lastSpawnTimestamp = currentTime - CARD_SPAWN_INTERVAL_MS; // Pretend a card just spawned one interval ago to get a sensible starting point
          setLastSpawnTime(lastSpawnTimestamp);
      }

      const elapsedTimeSinceLastScheduledSpawn = currentTime - lastSpawnTimestamp;

      if (elapsedTimeSinceLastScheduledSpawn >= CARD_SPAWN_INTERVAL_MS) {
        // A card is overdue or due now.
        // Calculate the *actual scheduled time* for this spawn event.
        const intervalsOverdue = Math.floor(elapsedTimeSinceLastScheduledSpawn / CARD_SPAWN_INTERVAL_MS);
        const actualSpawnTimeForThisEvent = lastSpawnTimestamp + intervalsOverdue * CARD_SPAWN_INTERVAL_MS;

        setCurrentRandomCard(pickRaritySpecificCard()); // Spawn the card immediately
        setLastSpawnTime(actualSpawnTimeForThisEvent); // Set last spawn time to this actual scheduled time
        startTimer(CARD_SPAWN_INTERVAL_MS / 1000); // Start timer for the *next* card with full duration
      } else {
        // Countdown is still active.
        setCurrentRandomCard(null); // No card visible yet
        const remainingMs = CARD_SPAWN_INTERVAL_MS - elapsedTimeSinceLastScheduledSpawn;
        startTimer(remainingMs / 1000); // Resume timer from calculated remaining time
      }
    };

    initializeTimer(); // Run once on mount

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        initializeTimer(); // Re-initialize when tab becomes visible
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [allCards, startTimer, pickRaritySpecificCard, setLastSpawnTime]);


  const handlePickUp = () => {
    if (currentRandomCard) {
      onPickCard(currentRandomCard);
      alert(`Você pegou a carta: ${currentRandomCard.name}!`);
      setCurrentRandomCard(null); // Make the card disappear
      setLastSpawnTime(Date.now()); // Reset the last spawn time to NOW, starting a new cycle
      startTimer(CARD_SPAWN_INTERVAL_MS / 1000); // Restart timer for next card with full duration
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Use Math.floor here to remove decimals
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-900 min-h-[calc(100vh-80px)]">
      <h2 className="text-5xl font-extrabold text-white mb-10 text-center bg-gradient-to-r from-green-400 to-teal-500 text-transparent bg-clip-text">JOGAR!</h2>

      {allCards.length === 0 ? (
        <p className="text-gray-400 text-xl mt-10 p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700">Crie algumas cartas na aba "Criar Cartas" para começar a jogar!</p>
      ) : (
        <>
          <p className="text-gray-300 text-2xl mb-8 p-3 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
            Próxima carta em: <span className="font-extrabold text-green-400 tracking-wide">{formatTime(remainingTime)}</span>
          </p>

          {currentRandomCard ? (
            <div className="flex flex-col items-center">
              <CardDisplay card={currentRandomCard} className="w-72 transform hover:scale-100" />
              <button
                onClick={handlePickUp}
                disabled={!currentRandomCard} // Button is disabled if no card is currently available
                className="mt-8 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 text-xl
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:from-gray-600 disabled:to-gray-700 hover:disabled:from-gray-600 hover:disabled:to-gray-700"
              >
                Pegar Carta!
              </button>
            </div>
          ) : (
            <p className="text-gray-400 text-xl mt-10 p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700 animate-pulse">Aguardando a próxima carta...</p>
          )}
        </>
      )}
    </div>
  );
};

export default GameArea;