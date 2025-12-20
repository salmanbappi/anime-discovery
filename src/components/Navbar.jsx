import React, { useState, useRef, useEffect } from 'react';
import { Navbar, Container, Nav, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const CustomNavbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

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
    <Navbar variant="dark" className="navbar-custom" expand="lg">
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
        
        <div className="d-flex align-items-center order-lg-last ms-3">
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
                     <button className="btn btn-link text-light p-1" onClick={toggleSearch}>
                         <i className="bi bi-search fs-5"></i>
                     </button>
                 )}
             </div>
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link href="#">Social</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="#">Login</Nav.Link>
            <Nav.Link href="#" className="btn btn-primary text-white px-3 rounded-pill ms-2" style={{ backgroundColor: '#3db4f2', border: 'none' }}>Sign Up</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
