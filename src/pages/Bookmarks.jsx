import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Spinner } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { getBookmarks } from '../services/bookmarkService'
import AnimeCard from '../components/AnimeCard'
import { motion } from 'framer-motion'

const Bookmarks = () => {
  const { user, loading: authLoading } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchBookmarks = async () => {
        const { data, error } = await getBookmarks(user.id)
        if (!error) setBookmarks(data)
        setLoading(false)
      }
      fetchBookmarks()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <Container className="text-center py-5 text-white">
        <h3>Please log in to see your bookmarks</h3>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <h2 className="section-title mb-5">Your Bookmarks</h2>
      {bookmarks.length > 0 ? (
        <Row className="g-4">
          {bookmarks.map((bookmark) => (
            <Col key={bookmark.anime_id} xs={6} sm={4} md={3} lg={2}>
              <AnimeCard 
                anime={{
                  id: bookmark.anime_id,
                  title: { english: bookmark.anime_title },
                  coverImage: { large: bookmark.anime_image }
                }} 
              />
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-white-50 text-center py-5">You haven't bookmarked any anime yet.</p>
      )}
    </Container>
  )
}

export default Bookmarks
