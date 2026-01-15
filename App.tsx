import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Card, RewardCard } from './types';
import Navbar from './components/Navbar';
import CardForm from './components/CardForm';
import RewardCardForm from './components/RewardCardForm';
import GameArea from './components/GameArea';
import DeckList from './components/DeckList';
import RewardList from './components/RewardList';
import SaveLoad from './components/SaveLoad';
import CardModal from './components/CardModal'; // Import the new modal component

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [rewardCards, setRewardCards] = useState<RewardCard[]>([]);
  // Deck stores cardId -> quantity
  const [deck, setDeck] = useState<Map<string, number>>(new Map());
  const [selectedCardForModal, setSelectedCardForModal] = useState<Card | RewardCard | null>(null); // New state for modal

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const storedCards = localStorage.getItem('cb_cards_cards');
      if (storedCards) {
        setCards(JSON.parse(storedCards));
      }
      const storedRewardCards = localStorage.getItem('cb_cards_reward_cards');
      if (storedRewardCards) {
        setRewardCards(JSON.parse(storedRewardCards));
      }
      const storedDeck = localStorage.getItem('cb_cards_deck');
      if (storedDeck) {
        setDeck(new Map(JSON.parse(storedDeck)));
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
      alert('Erro ao carregar o estado do jogo do armazenamento local. Seus dados podem estar corrompidos.');
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cb_cards_cards', JSON.stringify(cards));
    } catch (error) {
      console.error('Erro ao salvar cartas no localStorage:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('Erro: Espaço de armazenamento do navegador esgotado! Você pode ter muitas cartas ou imagens muito grandes. Considere salvar seu jogo e limpar o armazenamento.');
      } else {
        alert('Erro ao salvar cartas. Por favor, tente novamente.');
      }
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem('cb_cards_reward_cards', JSON.stringify(rewardCards));
    } catch (error) {
      console.error('Erro ao salvar recompensas no localStorage:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('Erro: Espaço de armazenamento do navegador esgotado! Você pode ter muitas cartas de recompensa ou imagens muito grandes. Considere salvar seu jogo e limpar o armazenamento.');
      } else {
        alert('Erro ao salvar recompensas. Por favor, tente novamente.');
      }
    }
  }, [rewardCards]);

  useEffect(() => {
    try {
      localStorage.setItem('cb_cards_deck', JSON.stringify(Array.from(deck.entries())));
    } catch (error) {
      console.error('Erro ao salvar deck no localStorage:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('Erro: Espaço de armazenamento do navegador esgotado! Você pode ter muitas cartas no seu deck. Considere salvar seu jogo e limpar o armazenamento.');
      } else {
        alert('Erro ao salvar deck. Por favor, tente novamente.');
      }
    }
  }, [deck]);

  const handleAddCard = useCallback((newCard: Omit<Card, 'id'>) => {
    const cardWithId: Card = { ...newCard, id: crypto.randomUUID() };
    setCards((prev) => [...prev, cardWithId]);
    alert(`Carta "${newCard.name}" criada!`);
  }, []);

  const handleAddRewardCard = useCallback((newRewardCard: Omit<RewardCard, 'id'>) => {
    const rewardCardWithId: RewardCard = { ...newRewardCard, id: crypto.randomUUID() };
    setRewardCards((prev) => [...prev, rewardCardWithId]);
    alert(`Carta de Recompensa "${newRewardCard.name}" criada!`);
  }, []);

  const handlePickCard = useCallback((card: Card) => {
    setDeck((prevDeck) => {
      const newDeck = new Map(prevDeck);
      // Fix: Explicitly cast the result of (newDeck.get(card.id) || 0) to number
      newDeck.set(card.id, ((newDeck.get(card.id) || 0) as number) + 1);
      return newDeck;
    });
  }, []);

  const handleRedeemReward = useCallback((rewardCardId: string) => {
    const reward = rewardCards.find((r) => r.id === rewardCardId);
    if (!reward) {
      alert('Recompensa não encontrada.');
      return;
    }

    setDeck((prevDeck) => {
      const newDeck = new Map(prevDeck);
      let canRedeem = true;

      // Check if player has all required cards
      for (const req of reward.requiredCards) {
        const currentQuantity = newDeck.get(req.cardId) || 0;
        if (currentQuantity < req.quantity) {
          canRedeem = false;
          break;
        }
      }

      if (!canRedeem) {
        alert('Você não tem as cartas necessárias para resgatar esta recompensa.');
        return prevDeck;
      }

      // Consume required cards
      for (const req of reward.requiredCards) {
        // Fix: Explicitly cast currentQuantity to number and store in a new variable
        const currentQuantityInDeck = (newDeck.get(req.cardId) || 0) as number;
        const newQuantity = currentQuantityInDeck - req.quantity;
        newDeck.set(req.cardId, newQuantity);
        // Fix: Use the calculated newQuantity for comparison
        if (newQuantity <= 0) {
          newDeck.delete(req.cardId);
        }
      }

      // Add reward card to deck (if it's a new card for the deck, set quantity to 1)
      // Fix: Explicitly cast the result of (newDeck.get(reward.id) || 0) to number
      newDeck.set(reward.id, ((newDeck.get(reward.id) || 0) as number) + 1);


      alert(`Recompensa "${reward.name}" resgatada e adicionada ao seu deck!`);
      return newDeck;
    });
  }, [rewardCards, cards]);

  const handleOpenModal = useCallback((card: Card | RewardCard) => {
    setSelectedCardForModal(card);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedCardForModal(null);
  }, []);

  return (
    <Router>
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<CardForm onAddCard={handleAddCard} />} />
          <Route
            path="/create-reward"
            element={<RewardCardForm allCards={cards} onAddRewardCard={handleAddRewardCard} />}
          />
          <Route
            path="/game"
            element={<GameArea allCards={cards} onPickCard={handlePickCard} />}
          />
          <Route path="/deck" element={<DeckList deck={deck} allCards={[...cards, ...rewardCards]} onCardClick={handleOpenModal} />} />
          <Route
            path="/rewards"
            element={
              <RewardList
                rewardCards={rewardCards}
                allCards={cards}
                deck={deck}
                onRedeem={handleRedeemReward}
                onCardClick={handleOpenModal}
              />
            }
          />
          <Route
            path="/save-load"
            element={
              <SaveLoad
                cards={cards}
                rewardCards={rewardCards}
                deck={deck}
                setCards={setCards}
                setRewardCards={setRewardCards}
                setDeck={setDeck}
              />
            }
          />
        </Routes>
      </main>
      {selectedCardForModal && <CardModal card={selectedCardForModal} onClose={handleCloseModal} allRegularCards={cards} />}
    </Router>
  );
};

export default App;