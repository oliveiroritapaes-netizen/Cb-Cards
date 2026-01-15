import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Criar Cartas' },
    { path: '/create-reward', name: 'Criar Recompensas' },
    { path: '/game', name: 'Jogar' },
    { path: '/deck', name: 'Meu Deck' },
    { path: '/rewards', name: 'Recompensas' },
    { path: '/save-load', name: 'Salvar/Carregar' },
  ];

  return (
    <nav className="bg-gray-900 shadow-xl py-4 px-6 sticky top-0 z-50 border-b border-gray-700">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
        <Link to="/" className="text-3xl font-extrabold text-white hover:text-blue-400 transition-colors duration-200">
          Cb <span className="text-blue-400">Cards</span>
        </Link>
        <div className="flex-grow flex justify-end">
          <ul className="flex flex-wrap space-x-4 md:space-x-6">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`relative text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200 text-sm md:text-base py-1 px-2
                    ${location.pathname === item.path ? 'text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400' : ''}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
