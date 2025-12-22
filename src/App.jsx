import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import CustomNavbar from './components/Navbar';
import Home from './pages/Home';
import AnimeDetails from './pages/AnimeDetails';
import CharacterDetails from './pages/CharacterDetails';
import StudioDetails from './pages/StudioDetails';
import Auth from './pages/Auth';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <BackToTop />
      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
      <div className="App min-vh-100" style={{ backgroundColor: 'var(--bg-color)' }}>
        <CustomNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/character/:id" element={<CharacterDetails />} />
          <Route path="/studio/:id" element={<StudioDetails />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;