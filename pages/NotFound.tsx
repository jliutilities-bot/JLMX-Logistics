
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-4">Página No Encontrada</p>
      <p className="text-gray-500 mt-2">Lo sentimos, la página que buscas no existe.</p>
      <Link to="/" className="mt-6 inline-block bg-[#1a2a4a] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#2c5aa0] transition-colors">
        Volver al Portal
      </Link>
    </div>
  );
};

export default NotFound;
