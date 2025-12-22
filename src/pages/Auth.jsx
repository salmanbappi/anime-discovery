import React, { useState } from 'react'
import { Container, Form, Button, Alert, Card } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || "/"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) throw error
        toast.success('Check your email for the confirmation link!')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        toast.success('Welcome back!')
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card className="border-secondary bg-dark text-white shadow-lg rounded-xl">
          <Card.Body className="p-4">
            <h2 className="text-center mb-4 fw-bold">{isSignUp ? 'Join SoraList' : 'Welcome Back'}</h2>
            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label className="small text-muted">Email Address</Form.Label>
                <Form.Control 
                  type="email" 
                  required 
                  className="bg-black border-secondary text-white rounded-pill px-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-4" controlId="password">
                <Form.Label className="small text-muted">Password</Form.Label>
                <Form.Control 
                  type="password" 
                  required 
                  className="bg-black border-secondary text-white rounded-pill px-3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Button disabled={loading} className="w-100 rounded-pill py-2 fw-bold mb-3" type="submit">
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
              </Button>
            </Form>
            <div className="text-center mt-2 small text-muted">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span 
                className="text-primary fw-bold" 
                style={{ cursor: 'pointer' }}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Log In' : 'Sign Up'}
              </span>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}

export default Auth