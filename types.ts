
export enum Status {
  SOLICITADO = 'SOLICITADO',
  PROGRAMADO = 'PROGRAMADO',
  RECOLECTADO = 'RECOLECTADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
  REPROGRAMADO = 'REPROGRAMADO',
}

export interface Solicitud {
  // From Form
  solicitante: string;
  origen: string;
  destino: string;
  material: string;
  tipoBulto: string;
  cantidad: number;
  entregarArea: string;
  notifSolicitante: 'SI' | 'NO';
  emailSolicitante: string;

  // Calculated on creation
  tracking: string;
  status: Status;
  fechaHoraSolicitud: Date;
  
  // Gemini Analysis
  geminiAnalysis?: string;

  // From Assignment
  tipoTransporte?: string;
  operador?: string;
  numeroUnidad?: string;
  fechaHoraAsignacion?: Date;
  horaEstimadaRecoleccion?: string; 
  
  // From Tracking
  fechaHoraRecoleccion?: Date;
  urlFotoRecoleccion?: string;
  fechaHoraEntrega?: Date;
  urlFotoEntrega?: string;

  // Calculated on updates
  tiempoRecoleccion?: string; 
  tiempoEntrega?: string; 
  eficiencia?: string;
}

export interface ChatMessage {
  id: string;
  trackingId: string;
  sender: string;
  text: string;
  timestamp: Date;
}
