import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { fetchAnimeDetails } from '../services/anilist';
import AnimeCard from '../components/AnimeCard';

const AnimeDetails = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      window.scrollTo(0, 0); // Reset scroll to top
      const data = await fetchAnimeDetails(id);
      setAnime(data);
      setLoading(false);
    };

    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!anime) {
    return (
      <Container className="text-center py-5">
        <h3>Anime not found</h3>
        <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
      </Container>
    );
  }

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Banner */}
      {anime.bannerImage ? (
        <img src={anime.bannerImage} alt="Banner" className="banner-image" />
      ) : (
        <div style={{ height: '100px', backgroundColor: '#151f2e' }}></div>
      )}

      <Container>
        <Row className="details-header">
          {/* Sidebar (Left) */}
          <Col md={3} className="d-none d-md-block">
            <img 
              src={anime.coverImage.extraLarge} 
              alt={anime.title.english} 
              className="details-cover" 
            />
            
            <div className="sidebar-section mt-3">
              <div className="info-item">
                <span>Format</span>
                <strong>{anime.format}</strong>
              </div>
              <div className="info-item">
                <span>Episodes</span>
                <strong>{anime.episodes || '?'}</strong>
              </div>
              <div className="info-item">
                <span>Status</span>
                <strong>{anime.status}</strong>
              </div>
              <div className="info-item">
                <span>Season</span>
                <strong>{anime.season} {anime.seasonYear}</strong>
              </div>
              <div className="info-item">
                <span>Score</span>
                <strong>{anime.averageScore}%</strong>
              </div>
              <div className="info-item">
                 <span>Studio</span>
                 <strong>{anime.studios?.nodes[0]?.name || '-'}</strong>
              </div>
            </div>
          </Col>

          {/* Main Content (Right) */}
          <Col md={9}>
            {/* Mobile Cover (Visible only on small screens) */}
            <div className="d-md-none text-center mb-4">
                <img 
                    src={anime.coverImage.large} 
                    alt={anime.title.english} 
                    className="details-cover" 
                    style={{ width: '180px', marginTop: '-50px' }}
                />
            </div>

            <h1 className="mb-3 mt-md-5">{anime.title.english || anime.title.romaji}</h1>
            
            <p 
                className="text-muted" 
                style={{ lineHeight: '1.6', fontSize: '1rem' }}
                dangerouslySetInnerHTML={{ __html: anime.description }} 
            />

            <div className="mb-4">
                {anime.genres.map(genre => (
                    <span key={genre} className="genre-badge">{genre}</span>
                ))}
            </div>

            {/* Trailer Section */}
            {anime.trailer?.site === 'youtube' && (
                <div className="mb-5">
                    <h4 className="mb-3">Trailer</h4>
                    <div className="trailer-container">
                        <iframe
                            className="trailer-iframe"
                            src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                            title="Trailer"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

            {/* Characters Section */}
            {anime.characters?.edges?.length > 0 && (
                <div className="mb-5">
                    <h4 className="mb-3">Characters</h4>
                    <Row className="g-3">
                        {anime.characters.edges.map(edge => (
                            <Col xs={12} sm={6} md={4} key={edge.node.id}>
                                <div className="character-card">
                                    <img 
                                        src={edge.node.image.medium} 
                                        alt={edge.node.name.full} 
                                        className="character-img" 
                                    />
                                    <div className="character-info">
                                        <span className="character-name">{edge.node.name.full}</span>
                                        <span className="character-role">{edge.role}</span>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            {/* Recommendations Section */}
            {anime.recommendations?.nodes?.length > 0 && (
                <div>
                    <h4 className="mb-3">Recommendations</h4>
                    <Row className="g-3">
                        {anime.recommendations.nodes.map(rec => {
                            if (!rec.mediaRecommendation) return null;
                            return (
                                <Col xs={6} sm={4} md={3} lg={3} key={rec.mediaRecommendation.id}>
                                    <AnimeCard anime={rec.mediaRecommendation} />
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            )}

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AnimeDetails;