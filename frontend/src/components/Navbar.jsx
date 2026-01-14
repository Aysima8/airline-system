import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          ✈️ Airline System
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">
            Uçuş Ara
          </Link>

          {user ? (
            <>
              <Link to="/my-tickets" className="nav-link">
                Biletlerim
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin/add-flight" className="nav-link">
                  Uçuş Ekle
                </Link>
              )}

              <div className="user-menu">
                <span className="user-name">👤 {user.name}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Çıkış
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Giriş Yap
              </Link>
              <Link to="/register" className="nav-link btn-register">
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
