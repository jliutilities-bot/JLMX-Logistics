import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLogistics } from '../context/LogisticsContext';
import { Solicitud, Status } from '../types';
import { TIPO_TRANSPORTE_OPTIONS, ESTADO_OPTIONS } from '../constants';

const AsignacionRecursos: React.FC = () => {
  const { trackingId } = useParams<{ trackingId?: string }>();
  const navigate = useNavigate();
  const { getSolicitud, assignSolicitudResources } = useLogistics();

  const [trackingInput, setTrackingInput] = useState(trackingId || '');
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
      tipoTransporte: '',
      tipoTransporteOtro: '',
      operador: '',
      numeroUnidad: '',
      horaRecoleccion: '',
      estado: Status.PROGRAMADO,
  });

  useEffect(() => {
    if (trackingId) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingId]);

  const handleSearch = async () => {
    if (!trackingInput) {
      setError('Por favor, ingresa un número de seguimiento.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSolicitud(null);
    // Simulating API call delay
    setTimeout(() => {
        const found = getSolicitud(trackingInput);
        if (found) {
            setSolicitud(found);
            setFormData({
                tipoTransporte: found.tipoTransporte || '',
                tipoTransporteOtro: '',
                operador: found.operador || '',
                numeroUnidad: found.numeroUnidad || '',
                horaRecoleccion: found.horaEstimadaRecoleccion || '',
                // FIX: Default to PROGRAMADO for assignment if current status is SOLICITADO.
                // This prevents the form from submitting the old status.
                estado: found.status === Status.SOLICITADO ? Status.PROGRAMADO : found.status,
            });
        } else {
            setError('No se encontró una solicitud con ese número de seguimiento.');
        }
        setIsLoading(false);
    }, 500)
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (!solicitud) return;
      setIsSaving(true);

      const assignmentData = {
          tipoTransporte: formData.tipoTransporte === 'Otro' ? formData.tipoTransporteOtro : formData.tipoTransporte,
          operador: formData.operador,
          numeroUnidad: formData.numeroUnidad,
          horaEstimadaRecoleccion: formData.horaRecoleccion,
          status: formData.estado,
      }
      
      await assignSolicitudResources(solicitud.tracking, assignmentData);
      setIsSaving(false);
      alert('Recursos asignados correctamente!');
      navigate('/pendientes');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="font-['Georgia',_serif] text-3xl font-bold text-[#1a2a4a] mb-6 border-b-2 border-green-400 pb-4">
        Asignación de Recursos
      </h2>

      <div className="flex items-end space-x-4 mb-6">
        <div className="flex-grow">
          <label htmlFor="tracking" className="block text-sm font-medium text-gray-700 mb-1">Número de Seguimiento</label>
          <input type="text" id="tracking" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Ej: JLMX..." />
        </div>
        <button onClick={handleSearch} disabled={isLoading} className="bg-[#2c5aa0] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#1a2a4a] transition-colors duration-300 disabled:bg-gray-400">
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">{error}</div>}

      {solicitud && (
        <form onSubmit={handleSubmit}>
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
             <h3 className="font-['Georgia',_serif] text-xl font-bold text-[#1a2a4a] mb-3">Información de la Solicitud</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="font-semibold">Tracking:</span> {solicitud.tracking}</div>
                <div><span className="font-semibold">Estado:</span> {solicitud.status}</div>
                <div><span className="font-semibold">Solicitante:</span> {solicitud.solicitante}</div>
                <div><span className="font-semibold">Origen:</span> {solicitud.origen}</div>
                <div><span className="font-semibold">Destino:</span> {solicitud.destino}</div>
                <div><span className="font-semibold">Material:</span> {solicitud.material}</div>
             </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="tipoTransporte" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Transporte</label>
                    <select name="tipoTransporte" value={formData.tipoTransporte} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                        <option value="">Selecciona un tipo</option>
                        {TIPO_TRANSPORTE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                     {formData.tipoTransporte === 'Otro' && <input type="text" name="tipoTransporteOtro" placeholder="Especifique" value={formData.tipoTransporteOtro} onChange={handleChange} required className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>}
                </div>
                 <div>
                    <label htmlFor="operador" className="block text-sm font-medium text-gray-700 mb-1">Operador</label>
                    <input type="text" name="operador" value={formData.operador} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
            </div>
             <div className="grid md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="numeroUnidad" className="block text-sm font-medium text-gray-700 mb-1">Número de Unidad</label>
                    <input type="text" name="numeroUnidad" value={formData.numeroUnidad} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                 <div>
                    <label htmlFor="horaRecoleccion" className="block text-sm font-medium text-gray-700 mb-1">Hora Estimada de Recolección</label>
                    <input type="time" name="horaRecoleccion" value={formData.horaRecoleccion} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
            </div>
            <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Actualizar Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    {ESTADO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <button type="submit" disabled={isSaving} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-400">
                {isSaving ? 'Guardando...' : 'Guardar Asignación'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AsignacionRecursos;