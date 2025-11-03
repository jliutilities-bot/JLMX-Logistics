
import React, { useState } from 'react';
import { useLogistics } from '../context/LogisticsContext';
import { Status, Solicitud } from '../types';
import { Link } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const MovimientosPendientes: React.FC = () => {
  const { solicitudes, loading, error } = useLogistics();
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const pendingSolicitudes = solicitudes.filter(
    s => s.status !== Status.ENTREGADO && s.status !== Status.CANCELADO
  );

  const handleGenerateSummary = async () => {
      setIsSummarizing(true);
      setSummary('');
      const result = await geminiService.summarizePendingMovements(pendingSolicitudes);
      setSummary(result);
      setIsSummarizing(false);
  }

  const getStatusColor = (status: Status) => {
    switch(status) {
        case Status.SOLICITADO: return 'bg-blue-100 text-blue-800';
        case Status.PROGRAMADO: return 'bg-yellow-100 text-yellow-800';
        case Status.RECOLECTADO: return 'bg-indigo-100 text-indigo-800';
        case Status.REPROGRAMADO: return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="font-['Georgia',_serif] text-3xl font-bold text-[#1a2a4a] mb-4 sm:mb-0">
          Movimientos Pendientes
        </h2>
        <button 
            onClick={handleGenerateSummary}
            disabled={isSummarizing || pendingSolicitudes.length === 0}
            className="bg-[#2c5aa0] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#1a2a4a] transition-colors duration-300 disabled:bg-gray-400 flex items-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5a1.5 1.5 0 013 0V4H7v-.5a1.5 1.5 0 011.5-1.5zM10 5H7v-.5a.5.5 0 011 0V5zm3 0h-3V4a.5.5 0 011 0v.5A1.5 1.5 0 0113 4v1z" />
            </svg>
            <span>{isSummarizing ? 'Generando...' : 'Resumen con IA'}</span>
        </button>
      </div>

      {isSummarizing && <div className="text-center p-4">Cargando resumen de IA...</div>}
      {summary && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 prose max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}

      {loading && <p>Cargando movimientos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingSolicitudes.length > 0 ? (
                pendingSolicitudes.map((s: Solicitud) => (
                  <tr key={s.tracking}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.tracking}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.solicitante}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.origen} &rarr; {s.destino}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.fechaHoraSolicitud).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {s.status === Status.SOLICITADO && (
                        <Link to={`/asignacion/${s.tracking}`} className="text-indigo-600 hover:text-indigo-900">Asignar</Link>
                      )}
                       {s.status !== Status.SOLICITADO && (
                        <Link to={`/seguimiento/${s.tracking}`} className="text-green-600 hover:text-green-900">Ver</Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No hay movimientos pendientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MovimientosPendientes;
