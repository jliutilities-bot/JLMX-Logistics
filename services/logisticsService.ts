import { Solicitud, Status, ChatMessage } from '../types';

// ====================================================================
// =================== GOOGLE SHEETS BACKEND SETUP ====================
// ====================================================================

// --- INSTRUCTION: Replace this with your actual Google Apps Script URL ---
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby8J74kYa55dwNgoqgQTedwxSG8T54q--k-4pW9EcxBKPAyQboLp6oFoRbbsHBtZZ5T/exec';

// Helper to handle date strings from Google Sheets JSON response
const dateReviver = (key: string, value: any) => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
    if (typeof value === 'string' && isoDateRegex.test(value)) {
        return new Date(value);
    }
    return value;
};

const parseJsonResponse = (jsonString: string) => {
    try {
        return JSON.parse(jsonString, dateReviver);
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonString);
        throw new Error("Invalid response from server.");
    }
};

// Generic function to call the backend via POST
const callBackend = async (action: string, payload?: any): Promise<any> => {
    // FIX: Removed redundant check for SCRIPT_URL as it's already set. This resolves the TypeScript error.
    try {
        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action, payload }),
            redirect: 'follow',
        });

        const textResponse = await res.text();
        if (!res.ok) {
            throw new Error(`Network error: ${res.statusText} - ${textResponse}`);
        }

        const jsonResponse = parseJsonResponse(textResponse);
        if (jsonResponse.status === 'success') {
            return jsonResponse.data;
        } else {
            throw new Error(jsonResponse.message || 'Backend error');
        }
    } catch (e) {
        console.error(`Failed to execute action "${action}":`, e);
        throw e;
    }
};
// ====================================================================


// ============== CHAT (Still using LocalStorage) =====================
// NOTE: Chat functionality has been kept in localStorage for simplicity.
// This can be migrated to a separate Google Sheet if needed.
const CHAT_MESSAGES_KEY = 'jlmx_chat_messages';

const getChatMessagesFromStorage = (): ChatMessage[] => {
     try {
        const stored = localStorage.getItem(CHAT_MESSAGES_KEY);
        return stored ? JSON.parse(stored, dateReviver) : [];
    } catch (e) {
        console.error("Failed to load chat messages from localStorage", e);
        return [];
    }
};

const saveChatMessagesToStorage = (messages: ChatMessage[]) => {
     try {
        localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
        console.error("Failed to save chat messages to localStorage", e);
    }
};
// ====================================================================

const generateTrackingNumber = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `JLMX${day}${month}${year}${hours}${minutes}`;
};

const calculateDuration = (start: Date, end: Date): string => {
  if (!start || !end) return 'N/A';
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const calculateEfficiency = (solicitud: Solicitud): string => {
  if (!solicitud.fechaHoraEntrega || !solicitud.fechaHoraSolicitud) return 'N/A';
  const metaMinutes = 120;
  const deliveryTime = (solicitud.fechaHoraEntrega.getTime() - solicitud.fechaHoraSolicitud.getTime()) / (1000 * 60);
  
  if (deliveryTime <= metaMinutes) return '100.0%';

  const exceededMinutes = deliveryTime - metaMinutes;
  const efficiency = 100 - (exceededMinutes * 0.8);
  
  return `${Math.max(0, efficiency).toFixed(1)}%`;
};

export const logisticsService = {
  
  getAllSolicitudes: async (): Promise<Solicitud[]> => {
    // FIX: Removed redundant check for SCRIPT_URL as it's already set. This resolves the TypeScript error.
    const res = await fetch(SCRIPT_URL, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
    });
    const textResponse = await res.text();
    return parseJsonResponse(textResponse);
  },

  getSolicitudByTracking: async (tracking: string): Promise<Solicitud | undefined> => {
    const solicitudes = await logisticsService.getAllSolicitudes();
    return solicitudes.find(s => s.tracking === tracking);
  },

  createSolicitud: async (data: Omit<Solicitud, 'tracking' | 'status' | 'fechaHoraSolicitud'>): Promise<Solicitud> => {
    const newSolicitud: Solicitud = {
      ...data,
      tracking: generateTrackingNumber(),
      status: Status.SOLICITADO,
      fechaHoraSolicitud: new Date(),
    };
    return callBackend('CREATE_SOLICITUD', newSolicitud);
  },

  updateSolicitud: async (updatedData: Partial<Solicitud> & { tracking: string }): Promise<Solicitud> => {
    return callBackend('UPDATE_SOLICITUD', updatedData);
  },

  assignResources: async (tracking: string, assignmentData: Partial<Solicitud>): Promise<Solicitud | undefined> => {
    const payload = {
      ...assignmentData,
      tracking,
      fechaHoraAsignacion: new Date(),
    };
    return logisticsService.updateSolicitud(payload);
  },

  updateStatus: async (tracking: string, newStatus: Status, photoBase64?: string): Promise<Solicitud | undefined> => {
    const currentSolicitud = await logisticsService.getSolicitudByTracking(tracking);
    if (!currentSolicitud) return undefined;

    const payload: Partial<Solicitud> & { tracking: string } = { tracking, status: newStatus };
    const now = new Date();

    if (newStatus === Status.RECOLECTADO) {
      payload.fechaHoraRecoleccion = now;
      payload.urlFotoRecoleccion = photoBase64;
      payload.tiempoRecoleccion = calculateDuration(currentSolicitud.fechaHoraSolicitud, now);
    }

    if (newStatus === Status.ENTREGADO) {
      payload.fechaHoraEntrega = now;
      payload.urlFotoEntrega = photoBase64;
      if (!currentSolicitud.fechaHoraRecoleccion) {
          payload.fechaHoraRecoleccion = now;
          payload.tiempoRecoleccion = calculateDuration(currentSolicitud.fechaHoraSolicitud, now);
      }
      payload.tiempoEntrega = calculateDuration(currentSolicitud.fechaHoraSolicitud, now);
      const tempUpdated = { ...currentSolicitud, ...payload };
      payload.eficiencia = calculateEfficiency(tempUpdated);
    }
    return logisticsService.updateSolicitud(payload);
  },
  
  syncSolicitud: async (solicitud: Solicitud): Promise<Solicitud> => {
    // Used for QR code hydration. The backend script will update if exists, or create if not.
    return callBackend('UPDATE_SOLICITUD', solicitud);
  },

  // --- Chat ---
  getMessagesByTrackingId: async (trackingId: string): Promise<ChatMessage[]> => {
    const chatMessages = getChatMessagesFromStorage();
    const messages = chatMessages.filter(m => m.trackingId === trackingId).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return new Promise(resolve => setTimeout(() => resolve(messages), 200)); // mock delay
  },

  addMessage: async (trackingId: string, sender: string, text: string): Promise<ChatMessage> => {
    const chatMessages = getChatMessagesFromStorage();
    const newMessage: ChatMessage = {
      id: `msg${Date.now()}`,
      trackingId,
      sender,
      text,
      timestamp: new Date()
    };
    chatMessages.push(newMessage);
    saveChatMessagesToStorage(chatMessages);
    return new Promise(resolve => setTimeout(() => resolve(newMessage), 200)); // mock delay
  },
};