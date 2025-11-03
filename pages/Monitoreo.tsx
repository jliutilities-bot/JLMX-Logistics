
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const Monitoreo: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/seguimiento/${trackingId.trim()}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="font-['Georgia',_serif] text-3xl font-bold text-[#1a2a4a] mb-4">
          Consultar Seguimiento
        </h2>
        <p className="text-gray-600 mb-6">
          Ingresa el número de seguimiento para ver el estado completo del movimiento en tiempo real.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Introduce el Tracking Number"
            className="w-full flex-grow px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-lg"
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300"
          >
            Buscar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Monitoreo;
