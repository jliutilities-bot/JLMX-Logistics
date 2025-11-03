
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Solicitud, Status } from '../types';
import { logisticsService } from '../services/logisticsService';

interface LogisticsContextType {
  solicitudes: Solicitud[];
  loading: boolean;
  error: string | null;
  getSolicitud: (trackingId: string) => Solicitud | undefined;
  addSolicitud: (data: Omit<Solicitud, 'tracking' | 'status' | 'fechaHoraSolicitud'>) => Promise<Solicitud>;
  updateSolicitudStatus: (trackingId: string, status: Status, photoBase64?: string) => Promise<Solicitud | void>;
  assignSolicitudResources: (trackingId: string, data: Partial<Solicitud>) => Promise<Solicitud | void>;
  syncSolicitud: (solicitud: Solicitud) => Promise<Solicitud | void>;
  refreshSolicitudes: () => void;
}

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await logisticsService.getAllSolicitudes();
      setSolicitudes(data);
    } catch (e) {
      setError('Failed to fetch logistics data from Google Sheets.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const getSolicitud = useCallback((trackingId: string): Solicitud | undefined => {
    return solicitudes.find(s => s.tracking === trackingId);
  }, [solicitudes]);

  const addSolicitud = useCallback(async (data: Omit<Solicitud, 'tracking' | 'status' | 'fechaHoraSolicitud'>) => {
    const newSolicitud = await logisticsService.createSolicitud(data);
    setSolicitudes(prev => [...prev, newSolicitud]);
    return newSolicitud;
  }, []);

  const updateSolicitudStatus = useCallback(async (trackingId: string, status: Status, photoBase64?: string) => {
    const updated = await logisticsService.updateStatus(trackingId, status, photoBase64);
    if (updated) {
      setSolicitudes(prev => prev.map(s => (s.tracking === trackingId ? updated : s)));
      return updated;
    }
  }, []);
  
  const assignSolicitudResources = useCallback(async (trackingId: string, data: Partial<Solicitud>) => {
    const updated = await logisticsService.assignResources(trackingId, data);
    if(updated) {
       setSolicitudes(prev => prev.map(s => (s.tracking === trackingId ? updated : s)));
       return updated;
    }
  }, []);

  const syncSolicitud = useCallback(async (solicitud: Solicitud): Promise<Solicitud | void> => {
    const synced = await logisticsService.syncSolicitud(solicitud);
    if (synced) {
        setSolicitudes(prev => {
            const index = prev.findIndex(s => s.tracking === synced.tracking);
            if (index > -1) {
                return prev.map(s => s.tracking === synced.tracking ? synced : s);
            }
            return [...prev, synced];
        });
        return synced;
    }
  }, []);

  return (
    <LogisticsContext.Provider value={{ 
      solicitudes, 
      loading, 
      error, 
      getSolicitud, 
      addSolicitud, 
      updateSolicitudStatus,
      assignSolicitudResources,
      syncSolicitud,
      refreshSolicitudes: fetchSolicitudes,
    }}>
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = (): LogisticsContextType => {
  const context = useContext(LogisticsContext);
  if (context === undefined) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
};
