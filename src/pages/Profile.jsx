import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile } from '../services/profileService'
import { toast } from 'react-toastify'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ username: '', full_name: '', bio: '', avatar_url: '' })

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    setLoading(true)
    const { data } = await getProfile(user.id)
    
    if (data) {
      setProfile(data)
      setFormData({ 
        username: data.username || '', 
        full_name: data.full_name || '', 
        bio: data.bio || '',
        avatar_url: data.avatar_url || ''
      })
    }
    setLoading(false)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    const { error } = await updateProfile(user.id, formData)
    if (error) {
      toast.error("Error updating profile: " + error.message)
    } else {
      toast.success("Profile updated!")
      setProfile({ ...profile, ...formData })
      setEditing(false)
    }
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Spinner animation="border" variant="primary" />
    </div>
  )

  return (
    <Container className="py-5 text-white">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="bg-dark border-secondary text-white text-center p-4 shadow-lg">
            <div className="mb-4">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="rounded-circle object-fit-cover shadow" 
                  style={{ width: '120px', height: '120px', border: '3px solid var(--primary-color)' }}
                />
              ) : (
                <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center shadow" style={{ width: '120px', height: '120px', fontSize: '3rem' }}>
                  {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            
            {editing ? (
              <Form onSubmit={handleUpdateProfile} className="text-start">
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted">Username</Form.Label>
                  <Form.Control 
                    placeholder="Username" 
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted">Full Name</Form.Label>
                  <Form.Control 
                    placeholder="Full Name" 
                    value={formData.full_name} 
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted">Avatar URL</Form.Label>
                  <Form.Control 
                    placeholder="https://image-link.com/avatar.jpg" 
                    value={formData.avatar_url} 
                    onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small text-muted">Bio</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="Tell us about yourself..." 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit">Save Changes</Button>
                  <Button variant="outline-light" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </Form>
            ) : (
              <>
                <h2 className="fw-bold mb-1">{profile?.username || 'New Explorer'}</h2>
                <p className="text-primary mb-3">{profile?.full_name || user?.email}</p>
                <div className="bg-black bg-opacity-25 rounded p-3 mb-4">
                    <p className="mb-0 small">{profile?.bio || 'No bio added yet. Tell the world who you are!'}</p>
                </div>
                <div className="d-flex gap-2 justify-content-center">
                    <Button variant="primary" className="rounded-pill px-4" onClick={() => setEditing(true)}>
                        <i className="bi bi-pencil-square me-2"></i>Edit Profile
                    </Button>
                    <Button as={Link} to="/bookmarks" variant="outline-light" className="rounded-pill px-4">
                        <i className="bi bi-bookmark-fill me-2"></i>My Bookmarks
                    </Button>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Profile

