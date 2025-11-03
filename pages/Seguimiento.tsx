import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useLogistics } from '../context/LogisticsContext';
import { Solicitud, Status, ChatMessage } from '../types';
import { logisticsService } from '../services/logisticsService';

// Helper to convert a file to a base64 string for upload
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const StatusTimeline: React.FC<{ solicitud: Solicitud }> = ({ solicitud }) => {
    const statuses = [
        { name: Status.SOLICITADO, date: solicitud.fechaHoraSolicitud },
        { name: Status.PROGRAMADO, date: solicitud.fechaHoraAsignacion },
        { name: Status.RECOLECTADO, date: solicitud.fechaHoraRecoleccion },
        { name: Status.ENTREGADO, date: solicitud.fechaHoraEntrega },
    ];
    
    const currentStatusIndex = statuses.findIndex(s => s.name === solicitud.status);

    return (
        <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-4">
            {statuses.map((status, index) => {
                const dateValue = status.date ? (typeof status.date === 'string' ? new Date(status.date) : status.date) : null;
                const isActive = dateValue != null;
                const isCurrent = index === currentStatusIndex;
                return (
                    <li key={status.name} className="mb-10 ml-6">
                        <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                           {isActive && <svg className="w-3 h-3 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/></svg>}
                        </span>
                        <h3 className={`flex items-center mb-1 text-lg font-semibold ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>{status.name}</h3>
                        {isActive && <time className="block mb-2 text-sm font-normal leading-none text-gray-500">{dateValue.toLocaleString()}</time>}
                    </li>
                );
            })}
        </ol>
    );
};


const Seguimiento: React.FC = () => {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getSolicitud, updateSolicitudStatus, syncSolicitud, loading: isContextLoading } = useLogistics();
  const [solicitud, setSolicitud] = useState<Solicitud | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nextStatus, setNextStatus] = useState<Status | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
        if (!trackingId) return;

        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const decodedJson = atob(dataParam);
                const minifiedData = JSON.parse(decodedJson);

                const hydratedSolicitud: Solicitud = {
                    solicitante: minifiedData.s || 'N/A',
                    origen: minifiedData.o || 'N/A',
                    destino: minifiedData.d || 'N/A',
                    material: minifiedData.m || 'N/A',
                    tipoBulto: minifiedData.tb || 'N/A',
                    cantidad: minifiedData.c || 0,
                    entregarArea: minifiedData.ea || 'N/A',
                    notifSolicitante: 'NO',
                    emailSolicitante: '',
                    tracking: minifiedData.t,
                    fechaHoraSolicitud: new Date(minifiedData.f),
                    status: Status.SOLICITADO,
                };
                
                const syncedSolicitud = await syncSolicitud(hydratedSolicitud);
                setSolicitud(syncedSolicitud || hydratedSolicitud);
                
                const fetchedMessages = await logisticsService.getMessagesByTrackingId(trackingId);
                setMessages(fetchedMessages);

                navigate(`/seguimiento/${trackingId}`, { replace: true });

            } catch (e) {
                console.error("Failed to decode or process solicitud data from URL", e);
                setSolicitud(null);
            }
        } else if (!isContextLoading) {
            const foundSolicitud = getSolicitud(trackingId);
            setSolicitud(foundSolicitud || null);
            if(foundSolicitud){
                const fetchedMessages = await logisticsService.getMessagesByTrackingId(trackingId);
                setMessages(fetchedMessages);
            }
        }

        const storedUserName = localStorage.getItem('logisticsUserName');
        if (storedUserName) {
          setUserName(storedUserName);
        }
    }
    fetchInitialData();
  }, [trackingId, searchParams, isContextLoading, getSolicitud, navigate, syncSolicitud]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStatusUpdate = async (status: Status) => {
    setNextStatus(status);
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && trackingId && nextStatus) {
      setIsLoading(true);
      const file = event.target.files[0];
      try {
        const photoBase64 = await fileToBase64(file);
        const updated = await updateSolicitudStatus(trackingId, nextStatus, photoBase64);
        if (updated) {
          setSolicitud(updated);
        }
      } catch (error) {
        console.error("Error processing file or updating status:", error);
        alert("Hubo un error al subir la imagen. Intente de nuevo.");
      } finally {
        setIsLoading(false);
        setNextStatus(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !trackingId) return;

    let finalUserName = userName;
    if (!finalUserName) {
        if (!tempUserName.trim()) {
            alert('Por favor, ingresa tu nombre para enviar un mensaje.');
            return;
        }
        finalUserName = tempUserName.trim();
        setUserName(finalUserName);
        localStorage.setItem('logisticsUserName', finalUserName);
    }
    
    setIsSending(true);
    const sentMessage = await logisticsService.addMessage(trackingId, finalUserName, newMessage.trim());
    
    setMessages(prevMessages => [...prevMessages, sentMessage]);
    setNewMessage('');
    setIsSending(false);
  };

  if (solicitud === undefined || isContextLoading) {
    return <div>Cargando...</div>;
  }

  if (solicitud === null) {
    return <div>No se encontró la solicitud con el tracking ID: {trackingId}</div>;
  }

  const renderActionButtons = () => {
    if (isLoading) {
        return <div className="text-center font-semibold">Procesando...</div>
    }

    switch (solicitud.status) {
      case Status.SOLICITADO:
        return <div className="bg-blue-100 text-blue-800 text-center p-4 rounded-lg font-semibold">SIN RECURSOS ASIGNADOS</div>;
      case Status.PROGRAMADO:
        return <button onClick={() => handleStatusUpdate(Status.RECOLECTADO)} className="w-full bg-blue-500 text-white font-bold py-4 rounded-lg text-lg hover:bg-blue-600">CONFIRMAR RECOLECCIÓN</button>;
      case Status.RECOLECTADO:
        return <button onClick={() => handleStatusUpdate(Status.ENTREGADO)} className="w-full bg-green-500 text-white font-bold py-4 rounded-lg text-lg hover:bg-green-600">CONFIRMAR ENTREGA</button>;
      case Status.ENTREGADO:
        return <div className="bg-green-100 text-green-800 text-center p-4 rounded-lg font-semibold">MOVIMIENTO COMPLETADO</div>;
      case Status.CANCELADO:
      case Status.REPROGRAMADO:
         return <div className="bg-red-100 text-red-800 text-center p-4 rounded-lg font-semibold">ESTADO: {solicitud.status}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="font-['Georgia',_serif] text-3xl font-bold text-[#1a2a4a] mb-2">Seguimiento de Movimiento</h2>
      <p className="text-gray-500 text-lg mb-6">{solicitud.tracking}</p>

      <div className="md:grid md:grid-cols-2 gap-8">
        <div>
            <h3 className="text-xl font-semibold text-[#1a2a4a] mb-4">Detalles</h3>
            <div className="space-y-2 text-gray-700">
                <p><strong>De:</strong> {solicitud.origen} <strong>A:</strong> {solicitud.destino}</p>
                <p><strong>Material:</strong> {solicitud.material}</p>
                <p><strong>Cantidad:</strong> {solicitud.cantidad} {solicitud.tipoBulto}</p>
                <p><strong>Operador:</strong> {solicitud.operador || 'No asignado'}</p>
                 <p><strong>Unidad:</strong> {solicitud.numeroUnidad || 'N/A'}</p>
                 <p><strong>Eficiencia:</strong> {solicitud.eficiencia || 'N/A'}</p>
            </div>
             <div className="mt-8">
                <h3 className="text-xl font-semibold text-[#1a2a4a] mb-4">Acciones</h3>
                {renderActionButtons()}
                 <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
        </div>
        <div>
           <h3 className="text-xl font-semibold text-[#1a2a4a] mb-4">Historial</h3>
           <StatusTimeline solicitud={solicitud} />
        </div>
      </div>
       <div className="grid md:grid-cols-2 gap-8 mt-8 border-t pt-6">
        <div>
            <h4 className="font-semibold mb-2">Foto Recolección:</h4>
            {solicitud.urlFotoRecoleccion ? <img src={solicitud.urlFotoRecoleccion} alt="Recolección" className="rounded-lg shadow-md w-full" /> : <p>No disponible</p>}
        </div>
        <div>
            <h4 className="font-semibold mb-2">Foto Entrega:</h4>
            {solicitud.urlFotoEntrega ? <img src={solicitud.urlFotoEntrega} alt="Entrega" className="rounded-lg shadow-md w-full" /> : <p>No disponible</p>}
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-semibold text-[#1a2a4a] mb-4">Conversación Reciente</h3>
        <div className="bg-gray-50 p-4 rounded-lg h-80 overflow-y-auto flex flex-col space-y-4">
          {messages.length > 0 ? (
            messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === userName ? 'justify-end' : ''}`}>
                <div className={`flex flex-col space-y-1 text-sm max-w-xs mx-2 ${msg.sender === userName ? 'order-1 items-end' : 'order-2 items-start'}`}>
                  <div>
                    <span className={`px-4 py-2 rounded-lg inline-block ${msg.sender === userName ? 'rounded-br-none bg-blue-600 text-white' : 'rounded-bl-none bg-gray-200 text-gray-800'}`}>
                      {msg.text}
                      <div className="text-xs opacity-75 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </span>
                  </div>
                   <span className="text-xs text-gray-500">{msg.sender}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No hay mensajes aún.
            </div>
          )}
           <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="mt-4">
          {!userName && (
             <div className="mb-2">
                <input
                    type="text"
                    value={tempUserName}
                    onChange={(e) => setTempUserName(e.target.value)}
                    placeholder="Tu nombre..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
             </div>
          )}
          <div className="flex gap-4">
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="w-full flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                disabled={isSending}
            />
            <button
                type="submit"
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 disabled:bg-gray-400"
                disabled={isSending || !newMessage.trim()}
            >
                {isSending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Seguimiento;