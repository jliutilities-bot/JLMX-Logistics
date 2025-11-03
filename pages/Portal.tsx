
import React from 'react';
import { Link } from 'react-router-dom';

const Feature: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex items-center mb-4">
    <i className={`fas ${icon} text-2xl text-green-400 w-12 text-center`}></i>
    <div className="ml-4">
      <h3 className="text-md font-semibold">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  </div>
);

const PortalButton: React.FC<{ to: string, icon: string, text: string, primary?: boolean }> = ({ to, icon, text, primary = false }) => {
    const baseClasses = "w-full text-left p-4 rounded-lg font-semibold transition-all duration-300 ease-in-out flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-1";
    const primaryClasses = "bg-green-500 text-white hover:bg-green-600";
    const secondaryClasses = "bg-white text-[#1a2a4a] border border-gray-200 hover:bg-gray-50";

    return (
        <Link to={to} className={`${baseClasses} ${primary ? primaryClasses : secondaryClasses}`}>
            <i className={`fas ${icon} text-xl w-8 text-center mr-4`}></i>
            <span>{text}</span>
        </Link>
    );
};


const Portal: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden md:flex">
      <div className="md:w-5/12 bg-[#1a2a4a] text-white p-8 flex flex-col justify-center">
        <h2 className="font-['Georgia',_serif] text-3xl font-bold mb-2">JONATHAN LOUIS</h2>
        <p className="opacity-90 font-light mb-8">Logística y Transporte</p>
        <Feature icon="fa-rocket" title="Registro Rápido" description="Solicita servicios de forma ágil y eficiente" />
        <Feature icon="fa-map-marked-alt" title="Seguimiento en Tiempo Real" description="Monitorea tus envíos en todo momento" />
        <Feature icon="fa-mobile-alt" title="Acceso Móvil" description="Gestiona desde cualquier dispositivo" />
      </div>
      <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
        <h2 className="font-['Georgia',_serif] text-3xl font-bold text-[#1a2a4a] mb-4">Portal de Servicio Logístico</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Accede a nuestro sistema de registro y seguimiento de movimientos de materiales. Gestiona tus solicitudes, monitorea en tiempo real y accede a reportes detallados para optimizar tus operaciones logísticas.
        </p>
        <div className="space-y-4">
            <PortalButton to="/solicitud" icon="fa-plus-circle" text="Nueva Solicitud" primary />
            <PortalButton to="/pendientes" icon="fa-clipboard-list" text="Movimientos Pendientes" />
            <PortalButton to="/monitoreo" icon="fa-search-location" text="Consultar Seguimiento" />
             <PortalButton to="/asignacion" icon="fa-truck" text="Asignación de Recursos" />
        </div>
      </div>
    </div>
  );
};

export default Portal;
