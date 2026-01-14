import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import SearchFlights from './pages/SearchFlights';
import BuyTicket from './pages/BuyTicket';
import AdminAddFlight from './pages/AdminAddFlight';
import Login from './pages/Login';
import Register from './pages/Register';
import MyTickets from './pages/MyTickets';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          {/* Stars */}
          <div className="stars">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="star"></div>
            ))}
          </div>

          {/* Clouds */}
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
          <div className="cloud cloud4"></div>

          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<SearchFlights />} />
              <Route path="/buy-ticket" element={<BuyTicket />} />
              <Route path="/admin/add-flight" element={<AdminAddFlight />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-tickets" element={<MyTickets />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
