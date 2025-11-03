import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Solicitud } from '../types';

interface LabelProps {
  solicitud: Solicitud;
  onPrint: () => void;
}

const Label: React.FC<LabelProps> = ({ solicitud, onPrint }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrCodeRef.current && (window as any).QRCode) {
      qrCodeRef.current.innerHTML = '';
      
      const currentUrl = window.location.href;
      const baseUrl = currentUrl.split('#')[0];
      
      // FINAL FIX: Simplify the data payload to the absolute minimum required for hydration.
      // This ensures the QR code is as simple and scannable as possible.
      const minifiedData = {
          s: solicitud.solicitante,
          o: solicitud.origen,
          d: solicitud.destino,
          m: solicitud.material,
          tb: solicitud.tipoBulto,
          c: solicitud.cantidad,
          ea: solicitud.entregarArea,
          t: solicitud.tracking,
          f: solicitud.fechaHoraSolicitud.toISOString(),
      };
      
      const solicitudJson = JSON.stringify(minifiedData);
      const encodedData = btoa(solicitudJson);
      
      const trackingUrl = `${baseUrl}#/seguimiento/${solicitud.tracking}?data=${encodedData}`;

      new (window as any).QRCode(qrCodeRef.current, {
        text: trackingUrl,
        width: 200,
        height: 200,
        colorDark: '#1a2a4a',
        colorLight: '#ffffff',
        correctLevel: (window as any).QRCode.CorrectLevel.M,
      });
    }
  }, [solicitud]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full">
        <div id="printable-label" className="w-[4in] h-[6in] bg-white border border-gray-300 p-3 flex flex-col font-sans text-[#1a2a4a] mx-auto">
            <div className="text-center border-b-2 border-green-500 pb-2 mb-4">
                <h1 className="font-['Georgia',_serif] text-2xl font-bold">JONATHAN LOUIS</h1>
                <p className="text-sm opacity-80">Logística y Transporte</p>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center">
                <Link to={`/seguimiento/${solicitud.tracking}`} className="font-['Georgia',_serif] text-2xl font-bold border-2 border-green-500 bg-gray-100 px-4 py-2 rounded-md hover:bg-green-100 transition-colors">
                    {solicitud.tracking}
                </Link>
                <div ref={qrCodeRef} className="my-4 p-2 bg-white border border-gray-200 rounded-md"></div>
                <p className="text-xs text-center font-semibold">ESCANEE PARA ACTUALIZAR ESTADO</p>
            </div>

            <div className="border-t border-gray-300 pt-3 text-sm">
                <div className="flex justify-between mb-1">
                    <span className="font-bold">DESTINO:</span>
                    <span className="font-semibold">{solicitud.destino}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span className="font-bold">SOLICITANTE:</span>
                    <span className="font-semibold">{solicitud.solicitante}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">ENTREGAR EN:</span>
                    <span className="font-semibold">{solicitud.entregarArea}</span>
                </div>
            </div>

            <div className="text-center text-xs opacity-70 mt-4">
                4" x 6" - Etiqueta de Seguimiento
            </div>
        </div>
        <div className="mt-6 flex justify-center">
            <button
              onClick={onPrint}
              className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7V9h6v3z" clipRule="evenodd" /></svg>
              <span>Imprimir Etiqueta</span>
            </button>
        </div>
    </div>
  );
};

export default Label;