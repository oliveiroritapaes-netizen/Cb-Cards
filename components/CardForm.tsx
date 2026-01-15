import React, { useState } from 'react';
import { Card, Rarity } from '../types';
import { fileToBase64 } from '../utils/imageHelpers';

interface CardFormProps {
  onAddCard: (card: Omit<Card, 'id'>) => void;
}

const CardForm: React.FC<CardFormProps> = ({ onAddCard }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [rarity, setRarity] = useState<Rarity>(Rarity.COMMON);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !description) {
      alert('Nome e descrição são obrigatórios!');
      return;
    }
    if (!imageUrl) {
        alert('Por favor, faça upload de uma imagem para a carta.');
        return;
    }
    onAddCard({ imageUrl, name, rarity, description });
    setImageUrl('');
    setName('');
    setRarity(Rarity.COMMON);
    setDescription('');
    setImageFile(null);
    (document.getElementById('imageUpload') as HTMLInputElement).value = ''; // Clear file input
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-xl shadow-2xl max-w-lg mx-auto border border-gray-700">
      <h2 className="text-4xl font-extrabold text-white mb-8 text-center bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">Criar Nova Carta</h2>

      <div className="mb-6">
        <label htmlFor="imageUpload" className="block text-gray-300 text-sm font-bold mb-2 cursor-pointer">
          Upload da Imagem da Carta:
          <span className="ml-2 text-blue-400 hover:text-blue-300 transition-colors duration-200">Escolher Arquivo</span>
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-500 file:text-white
            hover:file:bg-blue-600 transition-colors duration-200
            aria-[invalid=true]:border-red-500"
          required
        />
        {imageUrl && (
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm mb-2">Prévia da Imagem:</p>
            <img src={imageUrl} alt="Prévia da Carta" className="max-w-[150px] max-h-[200px] object-cover rounded-md border border-gray-600 mx-auto shadow-md" />
          </div>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
          Nome da Carta:
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          placeholder="Nome da carta"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="rarity" className="block text-gray-300 text-sm font-bold mb-2">
          Raridade:
        </label>
        <select
          id="rarity"
          value={rarity}
          onChange={(e) => setRarity(e.target.value as Rarity)}
          className="shadow border border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        >
          {Object.values(Rarity).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
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
          className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 bg-gray-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none"
          placeholder="Descreva a carta..."
          required
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Adicionar Carta
      </button>
    </form>
  );
};

export default CardForm;
