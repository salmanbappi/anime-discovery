import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { fetchAnimeDetails } from '../services/anilist';
import AnimeCard from '../components/AnimeCard';

const AnimeDetails = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      const data = await fetchAnimeDetails(id);
      setAnime(data);
      setLoading(false);
    };
    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!anime) {
    return (
      <Container className="text-center py-5" style={{ color: 'var(--text-color)' }}>
        <h3>Anime not found</h3>
        <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
      </Container>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      style={{ paddingBottom: '5rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      {/* Cinematic Banner */}
      <div className="details-banner-container">
        {anime.bannerImage ? (
          <img src={anime.bannerImage} alt="Banner" className="details-banner-img" />
        ) : (
          <div className="details-banner-placeholder"></div>
        )}
        <div className="details-banner-overlay"></div>
      </div>

      <Container className="details-content-wrapper">
        <Row>
          {/* Sticky Sidebar */}
          <Col md={3} className="details-sidebar">
            <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }}
            >
                <img src={anime.coverImage.extraLarge} alt={anime.title.english} className="details-poster shadow-lg" />
                
                <div className="sidebar-info-card mt-4">
                    <div className="info-row">
                        <span className="info-label">Format</span>
                        <span className="info-value">{anime.format}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Episodes</span>
                        <span className="info-value">{anime.episodes || '?'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Status</span>
                        <span className="info-value">{anime.status}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Season</span>
                        <span className="info-value text-capitalize">{anime.season?.toLowerCase()} {anime.seasonYear}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Score</span>
                        <span className="info-value text-primary fw-bold">{anime.averageScore}%</span>
                    </div>
                    <div className="info-row border-0">
                        <span className="info-label">Studio</span>
                        <span className="info-value">{anime.studios?.nodes[0]?.name || '-'}</span>
                    </div>
                </div>
            </motion.div>
          </Col>

          {/* Main Content */}
          <Col md={9} className="ps-md-5">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <h1 className="details-title mb-3">{anime.title.english || anime.title.romaji}</h1>
                
                <div className="d-flex flex-wrap gap-2 mb-4">
                    {anime.genres.map(genre => (
                        <span key={genre} className="genre-pill">{genre}</span>
                    ))}
                </div>

                <div className="details-description mb-5">
                    <h4 className="section-subtitle">Overview</h4>
                    <p dangerouslySetInnerHTML={{ __html: anime.description }} />
                </div>

                {/* Trailer Section */}
                {anime.trailer?.site === 'youtube' && (
                    <div className="mb-5">
                        <h4 className="section-subtitle">Official Trailer</h4>
                        <div className="trailer-aspect-ratio rounded overflow-hidden shadow-lg">
                            <iframe
                                src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                                title="Trailer"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}

                {/* Characters */}
                {anime.characters?.edges?.length > 0 && (
                    <div className="mb-5">
                        <h4 className="section-subtitle">Characters</h4>
                        <Row className="g-3">
                            {anime.characters.edges.map(edge => (
                                <Col xs={12} sm={6} key={edge.node.id}>
                                    <div className="char-card-mini">
                                        <img src={edge.node.image.medium} alt={edge.node.name.full} className="char-img-mini" />
                                        <div className="char-info-mini">
                                            <div className="char-name-mini">{edge.node.name.full}</div>
                                            <div className="char-role-mini text-muted">{edge.role}</div>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                {/* Recommendations */}
                {anime.recommendations?.nodes?.length > 0 && (
                    <div>
                        <h4 className="section-subtitle">Similar Anime</h4>
                        <Row className="g-3">
                            {anime.recommendations.nodes.map(rec => {
                                if (!rec.mediaRecommendation) return null;
                                return (
                                    <Col xs={6} sm={4} md={3} key={rec.mediaRecommendation.id}>
                                        <AnimeCard anime={rec.mediaRecommendation} />
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                )}
            </motion.div>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default AnimeDetails;
