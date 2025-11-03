
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { LogisticsProvider } from './context/LogisticsContext';

import Layout from './components/Layout';
import Portal from './pages/Portal';
import NuevaSolicitud from './pages/NuevaSolicitud';
import MovimientosPendientes from './pages/MovimientosPendientes';
import AsignacionRecursos from './pages/AsignacionRecursos';
import Seguimiento from './pages/Seguimiento';
import Monitoreo from './pages/Monitoreo';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <LogisticsProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Portal />} />
            <Route path="/solicitud" element={<NuevaSolicitud />} />
            <Route path="/pendientes" element={<MovimientosPendientes />} />
            <Route path="/asignacion" element={<AsignacionRecursos />} />
            <Route path="/asignacion/:trackingId" element={<AsignacionRecursos />} />
            <Route path="/seguimiento/:trackingId" element={<Seguimiento />} />
            <Route path="/monitoreo" element={<Monitoreo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </HashRouter>
    </LogisticsProvider>
  );
};

export default App;
