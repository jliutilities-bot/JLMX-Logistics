
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
    const linkClass = "text-white hover:text-green-300 transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium";
    const activeLinkClass = "text-white bg-green-500";
  return (
    <header className="bg-[#1a2a4a] text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <h1 className="font-['Georgia',_serif] text-2xl font-bold">JONATHAN LOUIS</h1>
            <p className="ml-4 opacity-90 font-light text-lg hidden md:block">Logistics Portal</p>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={({isActive}) => isActive ? `${linkClass} ${activeLinkClass}`: linkClass} >Portal</NavLink>
              <NavLink to="/solicitud" className={({isActive}) => isActive ? `${linkClass} ${activeLinkClass}`: linkClass} >New Request</NavLink>
              <NavLink to="/pendientes" className={({isActive}) => isActive ? `${linkClass} ${activeLinkClass}`: linkClass} >Pending</NavLink>
              <NavLink to="/monitoreo" className={({isActive}) => isActive ? `${linkClass} ${activeLinkClass}`: linkClass} >Track</NavLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-[#1a2a4a] text-white text-center p-4 mt-auto">
    <p>&copy; {new Date().getFullYear()} Jonathan Louis. All rights reserved.</p>
  </footer>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
