import React from 'react';
import { Navbar, Container, Nav, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CustomNavbar = () => {
  return (
    <Navbar variant="dark" className="navbar-custom" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          <img
            alt=""
            src="https://anilist.co/img/icons/icon.svg"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
          />
          AniDiscovery
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link href="#">Search</Nav.Link>
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
