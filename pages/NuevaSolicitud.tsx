import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useLogistics } from '../context/LogisticsContext';
import { Solicitud } from '../types';
import { ORIGEN_DESTINO_OPTIONS, MATERIAL_OPTIONS, TIPO_BULTO_OPTIONS, ENTREGAR_AREA_OPTIONS } from '../constants';
import Label from '../components/Label';
import { geminiService } from '../services/geminiService';

const NuevaSolicitud: React.FC = () => {
  const [formData, setFormData] = useState({
    solicitante: '',
    origen: '',
    destino: '',
    material: '',
    materialOtro: '',
    tipoBulto: '',
    tipoBultoOtro: '',
    cantidad: '1',
    entregarArea: '',
    entregarAreaOtro: '',
    notifSolicitante: 'NO' as 'SI' | 'NO',
    emailSolicitante: '',
  });

  const [submittedSolicitud, setSubmittedSolicitud] = useState<Solicitud | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSolicitud } = useLogistics();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const material = formData.material === 'Otros' ? formData.materialOtro : formData.material;
    const tipoBulto = formData.tipoBulto === 'Otro' ? formData.tipoBultoOtro : formData.tipoBulto;
    const entregarArea = formData.entregarArea === 'Otro' ? formData.entregarAreaOtro : formData.entregarArea;

    const analysis = await geminiService.analyzeShipment(material, tipoBulto);

    const newSolicitudData = {
      ...formData,
      material,
      tipoBulto,
      entregarArea,
      cantidad: parseInt(formData.cantidad, 10),
      emailSolicitante: formData.notifSolicitante === 'SI' ? formData.emailSolicitante : 'N/A',
      geminiAnalysis: analysis,
    };

    try {
      const result = await addSolicitud(newSolicitudData);
      setSubmittedSolicitud(result);
    } catch (error) {
      console.error("Failed to create solicitud:", error);
      alert("Error al crear la solicitud. Por favor, intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // FIX: Implement a non-destructive print method using CSS media queries.
  // This prevents the React app from being destroyed and reloaded.
  const handlePrint = () => {
    window.print();
  };

  const handleCreateAnother = () => {
    setSubmittedSolicitud(null);
  };

  if (submittedSolicitud) {
    // FIX: Add print-specific styles to ensure only the label is printed,
    // and the on-screen buttons are hidden during printing.
    const printStyles = `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-label, #printable-label * {
            visibility: visible;
          }
          #printable-label {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .print-hidden {
            display: none !important;
          }
        }
    `;

    return (
      <>
        <style>{printStyles}</style>
        <div className="flex flex-col items-center">
          <Label solicitud={submittedSolicitud} onPrint={handlePrint} />
          <div className="mt-6 flex justify-center print-hidden">
              <button
                onClick={handleCreateAnother}
                className="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-300"
              >
                Crear Otra Solicitud
              </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="font-['Georgia',_serif] text-3xl font-bold text-[#1a2a4a] mb-6 border-b-2 border-green-400 pb-4">
        Nueva Solicitud de Servicio
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Form sections */}
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="solicitante" className="block text-sm font-medium text-gray-700 mb-1">Solicitante</label>
                <input type="text" name="solicitante" id="solicitante" value={formData.solicitante} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
            </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="origen" className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                <select name="origen" id="origen" value={formData.origen} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option value="">Selecciona un origen</option>
                    {ORIGEN_DESTINO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                <select name="destino" id="destino" value={formData.destino} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option value="">Selecciona un destino</option>
                    {ORIGEN_DESTINO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">Material (Clasificación)</label>
                <select name="material" id="material" value={formData.material} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option value="">Selecciona un material</option>
                    {MATERIAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                {formData.material === 'Otros' && <input type="text" name="materialOtro" placeholder="Especifique el material" value={formData.materialOtro} onChange={handleChange} required className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>}
            </div>
            <div>
                <label htmlFor="tipoBulto" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Bulto</label>
                <select name="tipoBulto" id="tipoBulto" value={formData.tipoBulto} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                     <option value="">Selecciona un tipo de bulto</option>
                    {TIPO_BULTO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                {formData.tipoBulto === 'Otro' && <input type="text" name="tipoBultoOtro" placeholder="Especifique el tipo de bulto" value={formData.tipoBultoOtro} onChange={handleChange} required className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>}
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input type="number" name="cantidad" id="cantidad" value={formData.cantidad} onChange={handleChange} required min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
            </div>
            <div>
                <label htmlFor="entregarArea" className="block text-sm font-medium text-gray-700 mb-1">Entregar en Área</label>
                <select name="entregarArea" id="entregarArea" value={formData.entregarArea} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option value="">Selecciona un área</option>
                    {ENTREGAR_AREA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                {formData.entregarArea === 'Otro' && <input type="text" name="entregarAreaOtro" placeholder="Especifique el área" value={formData.entregarAreaOtro} onChange={handleChange} required className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>}
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
                 <label htmlFor="notifSolicitante" className="block text-sm font-medium text-gray-700 mb-1">Notificar al solicitante?</label>
                 <select name="notifSolicitante" id="notifSolicitante" value={formData.notifSolicitante} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                </select>
            </div>
             {formData.notifSolicitante === 'SI' && (
                <div>
                    <label htmlFor="emailSolicitante" className="block text-sm font-medium text-gray-700 mb-1">Email del Solicitante</label>
                    <input type="email" name="emailSolicitante" id="emailSolicitante" value={formData.emailSolicitante} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
                </div>
             )}
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSubmitting} className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-400 flex items-center">
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : "Enviar Solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaSolicitud;