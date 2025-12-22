import React, { useState, useRef, useEffect } from 'react';
import { Navbar, Container, Form, Button } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomNavbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const { user, signOut } = useAuth();
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close search when location changes (navigating to anime details)
  useEffect(() => {
      if (!location.search.includes('q=')) {
          setIsSearchOpen(false);
          // Only clear query if we really moved away from search
          if (location.pathname !== '/') {
              setSearchQuery('');
          }
      }
  }, [location.pathname, location.search]);

  // Automatic Live Search (Debounced)
  useEffect(() => {
    // Don't trigger search if the bar is closed or if we are on a details page
    if (!isSearchOpen && !searchQuery) return;
    if (location.pathname.startsWith('/anime/')) return; 
    
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        // Only navigate if the query is different from URL to prevent loop
        const currentQ = new URLSearchParams(location.search).get('q');
        if (currentQ !== searchQuery) {
            navigate(`/?q=${encodeURIComponent(searchQuery)}`, { replace: true });
        }
      } else if (isSearchOpen && !searchQuery) {
        navigate(`/`, { replace: true });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, navigate, isSearchOpen, location.pathname, location.search]);

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
        {/* Brand Left - Hidden when searching on mobile */}
        {!isSearchOpen && (
            <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center" style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>
                <i className="bi bi-moon-stars-fill me-2" style={{ color: 'var(--primary-color)' }}></i>
                SoraList <small className="ms-2" style={{ fontSize: '0.6rem', opacity: 0.5 }}>v2.9.5</small>
            </Navbar.Brand>
        )}
        
        {/* Controls Right */}
        <div className={`d-flex align-items-center gap-2 gap-md-3 ${isSearchOpen ? 'flex-grow-1 justify-content-end' : ''}`}>
             {/* Search */}
             <div className={`nav-search-container ${isSearchOpen ? 'active w-100' : ''}`}>
                 {isSearchOpen ? (
                     <Form onSubmit={handleSearchSubmit} className="w-100">
                         <Form.Control 
                            ref={inputRef}
                            type="text" 
                            placeholder="Search anime..." 
                            className="nav-search-input w-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={handleBlur}
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

             {/* Auth Buttons */}
             {!isSearchOpen && (
                 <>
                    {user ? (
                        <div className="d-flex align-items-center gap-2">
                            <Link to="/bookmarks" className="btn btn-link p-1 text-white">
                                <i className="bi bi-bookmark-fill fs-5"></i>
                            </Link>
                            <Link to="/profile" className="btn btn-link p-1 text-white">
                                <i className="bi bi-person-circle fs-5"></i>
                            </Link>
                            <Button variant="outline-light" size="sm" className="rounded-pill px-3" onClick={signOut}>
                                Log Out
                            </Button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold">
                            Log In
                        </Link>
                    )}
                 </>
             )}
        </div>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;