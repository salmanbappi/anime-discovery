import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomNavbar from './components/Navbar';
import Home from './pages/Home';
import AnimeDetails from './pages/AnimeDetails';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="App">
        <CustomNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;