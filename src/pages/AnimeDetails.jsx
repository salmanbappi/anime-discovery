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
      className="details-page"
    >
      {/* Cinematic Blurred Banner */}
      <div className="details-banner-wrapper">
        <div 
            className="details-banner-blur" 
            style={{ backgroundImage: `url(${anime.bannerImage || anime.coverImage.extraLarge})` }}
        ></div>
        {anime.bannerImage && (
            <img src={anime.bannerImage} alt="Banner" className="details-banner-main" />
        )}
        <div className="details-banner-overlay"></div>
      </div>

      <Container className="details-main-container">
        <Row>
          {/* Left Sidebar: Poster & Stats */}
          <Col lg={5} md={6} className="details-sidebar-col">
            <motion.div 
                initial={{ y: 40, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.5 }}
            >
                <img src={anime.coverImage.extraLarge} alt={anime.title.english} className="details-main-poster shadow-2xl" />
                
                <div className="sidebar-stats-card mt-4">
                    <div className="stats-header">Information</div>
                    <div className="stat-row">
                        <span className="stat-label"><i className="bi bi-play-circle me-2"></i>Format</span>
                        <span className="stat-value">{anime.format}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label"><i className="bi bi-layers me-2"></i>Episodes</span>
                        <span className="stat-value">{anime.episodes || '?'}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label"><i className="bi bi-info-circle me-2"></i>Status</span>
                        <span className="stat-value text-capitalize">{anime.status?.toLowerCase().replace('_', ' ')}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label"><i className="bi bi-calendar-event me-2"></i>Season</span>
                        <span className="stat-value text-capitalize">{anime.season?.toLowerCase()} {anime.seasonYear}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label"><i className="bi bi-star-fill me-2 text-warning"></i>Score</span>
                        <span className="stat-value text-primary fw-bold">{anime.averageScore}%</span>
                    </div>
                    <div className="stat-row border-0">
                        <span className="stat-label"><i className="bi bi-building me-2"></i>Studio</span>
                        <span className="stat-value text-truncate ms-2" style={{ maxWidth: '250px' }}>
                            {anime.studios?.nodes[0]?.name || '-'}
                        </span>
                    </div>
                </div>
            </motion.div>
          </Col>

          {/* Right Content: Title, Description, etc. */}
          <Col lg={7} md={6} className="details-content-col ps-md-5">
            <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }}
            >
                {/* Title and Genres Moved to TOP */}
                <h1 className="main-title mb-2">{anime.title.english || anime.title.romaji}</h1>
                <div className="d-flex flex-wrap gap-2 mb-4">
                    {anime.genres.map(genre => (
                        <span key={genre} className="genre-tag">{genre}</span>
                    ))}
                </div>

                <div className="overview-section mb-5">
                    <h4 className="section-header">Description</h4>
                    <div className="description-box">
                        <p dangerouslySetInnerHTML={{ __html: anime.description }} />
                    </div>
                </div>

                {/* Trailer */}
                {anime.trailer?.site === 'youtube' && (
                    <div className="mb-5">
                        <h4 className="section-header">Official Trailer</h4>
                        <div className="video-container rounded-xl shadow-lg">
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
                        <h4 className="section-header">Characters</h4>
                        <Row className="g-3">
                            {anime.characters.edges.map(edge => (
                                <Col xs={12} sm={6} key={edge.node.id}>
                                    <div className="char-item">
                                        <img src={edge.node.image.medium} alt={edge.node.name.full} className="char-avatar" />
                                        <div className="char-details">
                                            <div className="char-name">{edge.node.name.full}</div>
                                            <div className="char-role text-muted">{edge.role}</div>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                {/* Recommendations */}
                {anime.recommendations?.nodes?.length > 0 && (
                    <div className="mb-4">
                        <h4 className="section-header">Recommended</h4>
                        <Row className="g-3">
                            {anime.recommendations.nodes.map(rec => {
                                if (!rec.mediaRecommendation) return null;
                                return (
                                    <Col xs={6} sm={4} lg={3} key={rec.mediaRecommendation.id}>
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