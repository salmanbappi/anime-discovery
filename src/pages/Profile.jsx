import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Spinner, Nav, Tab } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile } from '../services/profileService'
import { getLists, createList } from '../services/listService'
import AnimeCard from '../components/AnimeCard'
import { toast } from 'react-toastify'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [lists, setLists] = useState([])
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
    const [profRes, listsRes] = await Promise.all([
      getProfile(user.id),
      getLists(user.id)
    ])
    
    if (profRes.data) {
      setProfile(profRes.data)
      setFormData({ 
        username: profRes.data.username || '', 
        full_name: profRes.data.full_name || '', 
        bio: profRes.data.bio || '',
        avatar_url: profRes.data.avatar_url || ''
      })
    }
    
    if (listsRes.data) {
      setLists(listsRes.data)
      // Auto-create default lists if none exist
      if (listsRes.data.length === 0) {
        await handleCreateDefaultLists()
      }
    }
    setLoading(false)
  }

  const handleCreateDefaultLists = async () => {
    const defaults = ['Watching', 'Planning', 'Completed']
    for (const name of defaults) {
      await createList(user.id, name)
    }
    const { data } = await getLists(user.id)
    if (data) setLists(data)
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
      <Row className="mb-5">
        <Col md={4}>
          <Card className="bg-dark border-secondary text-white text-center p-4">
            <div className="mb-3">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="rounded-circle object-fit-cover" 
                  style={{ width: '100px', height: '100px', border: '2px solid var(--primary-color)' }}
                />
              ) : (
                <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                  {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {editing ? (
              <Form onSubmit={handleUpdateProfile}>
                <Form.Group className="mb-2">
                  <Form.Control 
                    size="sm" 
                    placeholder="Username" 
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control 
                    size="sm" 
                    placeholder="Full Name" 
                    value={formData.full_name} 
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control 
                    size="sm" 
                    placeholder="Avatar URL (Image Link)" 
                    value={formData.avatar_url} 
                    onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    size="sm" 
                    placeholder="Bio" 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button variant="primary" size="sm" type="submit">Save</Button>
                  <Button variant="outline-light" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </Form>
            ) : (
              <>
                <h3>{profile?.username || 'New Explorer'}</h3>
                <p className="text-muted small">{profile?.full_name}</p>
                <p className="small mb-4">{profile?.bio || 'No bio yet...'}</p>
                <Button variant="outline-primary" size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>
              </>
            )}
          </Card>
        </Col>
        
        <Col md={8}>
          <Tab.Container defaultActiveKey={lists[0]?.id}>
            <Nav variant="pills" className="mb-4 gap-2">
              {lists.map(list => (
                <Nav.Item key={list.id}>
                  <Nav.Link eventKey={list.id} className="rounded-pill border-secondary px-4">
                    {list.name}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
            <Tab.Content>
              {lists.map(list => (
                <Tab.Pane key={list.id} eventKey={list.id}>
                  <h4 className="mb-4">{list.name} List ({list.list_items?.length || 0})</h4>
                  {list.list_items?.length > 0 ? (
                    <Row className="g-3">
                      {list.list_items.map(item => (
                        <Col key={item.id} xs={6} sm={4} lg={3}>
                          <AnimeCard anime={{
                            id: item.anime_id,
                            title: { english: item.anime_title },
                            coverImage: { large: item.anime_image },
                            averageScore: item.anime_score,
                            format: item.anime_format
                          }} />
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <div className="text-center py-5 border border-secondary rounded border-dashed">
                      <p className="text-muted">No anime in this list yet.</p>
                    </div>
                  )}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  )
}

export default Profile
