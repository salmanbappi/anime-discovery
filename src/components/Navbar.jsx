import React, { useState, useRef, useEffect } from 'react';
import { Navbar, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const CustomNavbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleSearch = () => {
      setIsSearchOpen(!isSearchOpen);
      if (!isSearchOpen) {
          setTimeout(() => inputRef.current?.focus(), 100);
      }
  };

  const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
          navigate(`/?q=${encodeURIComponent(searchQuery)}`);
      }
  };

  const handleBlur = () => {
      if (!searchQuery) {
          setIsSearchOpen(false);
      }
  };

  return (
    <Navbar className="navbar-custom py-3" sticky="top">
      <Container className="d-flex justify-content-between align-items-center">
        {/* Brand Left */}
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center" style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>
          <i className="bi bi-stars me-2" style={{ color: 'var(--primary-color)' }}></i>
          SoraList
        </Navbar.Brand>
        
        {/* Controls Right */}
        <div className="d-flex align-items-center gap-3">
             {/* Search */}
             <div className={`nav-search-container ${isSearchOpen ? 'active' : ''}`}>
                 {isSearchOpen ? (
                     <Form onSubmit={handleSearchSubmit}>
                         <Form.Control 
                            ref={inputRef}
                            type="text" 
                            placeholder="Search anime..." 
                            className="nav-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={handleBlur}
                            style={{ width: '250px' }}
                         />
                     </Form>
                 ) : (
                     <button 
                        className="btn btn-link p-1" 
                        onClick={toggleSearch}
                        style={{ color: 'var(--text-color)' }}
                    >
                         <i className="bi bi-search fs-5"></i>
                     </button>
                 )}
             </div>

             {/* Theme Toggle */}
             <button 
                className="btn btn-link p-1" 
                onClick={toggleTheme}
                style={{ color: 'var(--text-color)' }}
             >
                 {theme === 'dark' ? (
                     <i className="bi bi-sun-fill fs-5"></i>
                 ) : (
                     <i className="bi bi-moon-fill fs-5"></i>
                 )}
             </button>
        </div>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;