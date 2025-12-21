import React, { useState, useRef, useEffect } from 'react';
import { Navbar, Container, Nav, Form } from 'react-bootstrap';
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
          // Optional: close search on submit? 
          // setIsSearchOpen(false); 
      }
  };

  const handleBlur = () => {
      if (!searchQuery) {
          setIsSearchOpen(false);
      }
  };

  return (
    <Navbar className="navbar-custom" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          <img
            alt="AD Logo"
            src={import.meta.env.BASE_URL + "AD-logo.svg"}
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
          />
          AniDiscovery
        </Navbar.Brand>
        
        <div className="d-flex align-items-center order-lg-last ms-3 gap-2">
             {/* Theme Toggle */}
             <button 
                className="btn btn-link p-1" 
                onClick={toggleTheme}
                style={{ color: 'var(--color-nav-text)' }}
             >
                 {theme === 'dark' ? (
                     <i className="bi bi-sun-fill fs-5"></i>
                 ) : (
                     <i className="bi bi-moon-fill fs-5"></i>
                 )}
             </button>

             {/* Search Toggle */}
             <div className={`nav-search-container ${isSearchOpen ? 'active' : ''}`}>
                 {isSearchOpen ? (
                     <Form onSubmit={handleSearchSubmit} className="d-flex">
                         <Form.Control 
                            ref={inputRef}
                            type="text" 
                            placeholder="Search..." 
                            className="nav-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={handleBlur}
                         />
                     </Form>
                 ) : (
                     <button 
                        className="btn btn-link p-1" 
                        onClick={toggleSearch}
                        style={{ color: 'var(--color-nav-text)' }}
                    >
                         <i className="bi bi-search fs-5"></i>
                     </button>
                 )}
             </div>
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/#trending">Trending</Nav.Link>
            <Nav.Link as={Link} to="/#popular">Popular</Nav.Link>
            <Nav.Link href="https://github.com/salmanbappi" target="_blank">Social</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="#">Login</Nav.Link>
            <Nav.Link href="#" className="btn btn-primary text-white px-3 rounded-pill ms-lg-2" style={{ backgroundColor: '#3db4f2', border: 'none' }}>Sign Up</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default CustomNavbar;
