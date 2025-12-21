import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { motion as Motion } from 'framer-motion';
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', backgroundColor: '#000' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!anime) {
    return (
      <Container className="text-center py-5 text-white">
        <h3>Anime not found</h3>
        <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
      </Container>
    );
  }

  return (
    <Motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="details-page-v2"
    >
      <Container className="py-3">
        {/* 1. Cinematic Banner (Top) */}
        <Motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="top-banner-container mb-4"
        >
            <img 
                src={anime.bannerImage || anime.coverImage.extraLarge} 
                alt="Banner" 
                className="top-banner-img rounded-xl shadow-lg" 
            />
        </Motion.div>

        {/* 2. Information Card (Full Width) */}
        <div className="info-card-v2 mb-4">
            <h5 className="info-header-v2">INFORMATION</h5>
            <div className="info-grid-v2">
                <div className="info-item-v2">
                    <span className="info-label-v2"><i className="bi bi-play-circle me-2"></i>Format</span>
                    <span className="info-value-v2">{anime.format}</span>
                </div>
                <div className="info-item-v2">
                    <span className="info-label-v2"><i className="bi bi-layers me-2"></i>Episodes</span>
                    <span className="info-value-v2">{anime.episodes || '?'}</span>
                </div>
                <div className="info-item-v2">
                    <span className="info-label-v2"><i className="bi bi-info-circle me-2"></i>Status</span>
                    <span className="info-value-v2 text-capitalize">{anime.status?.toLowerCase().replace('_', ' ')}</span>
                </div>
                <div className="info-item-v2">
                    <span className="info-label-v2"><i className="bi bi-calendar-event me-2"></i>Season</span>
                    <span className="info-value-v2 text-capitalize">{anime.season?.toLowerCase()} {anime.seasonYear}</span>
                </div>
                <div className="info-item-v2">
                    <span className="info-label-v2"><i className="bi bi-star-fill me-2 text-warning"></i>Score</span>
                    <span className="info-value-v2 text-primary fw-bold">{anime.averageScore}%</span>
                </div>
                <div className="info-item-v2 border-0">
                    <span className="info-label-v2"><i className="bi bi-building me-2"></i>Studio</span>
                    <span className="info-value-v2">{anime.studios?.nodes[0]?.name || '-'}</span>
                </div>
            </div>
        </div>

        {/* 3. Characters (Two Column Grid) */}
        {anime.characters?.edges?.length > 0 && (
            <div className="mb-5">
                <h5 className="section-header-v2">CHARACTERS</h5>
                <Row className="g-3">
                    {anime.characters.edges.map(edge => (
                        <Col xs={12} md={6} key={edge.node.id}>
                            <div className="char-card-v2">
                                <img src={edge.node.image.medium} alt={edge.node.name.full} className="char-img-v2" />
                                <div className="char-info-v2">
                                    <div className="char-name-v2 text-white">{edge.node.name.full}</div>
                                    <div className="char-role-v2">{edge.role}</div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>
        )}

        {/* 4. Main Title and Genres (Moved Down) */}
        <div className="text-center mt-5 mb-4">
            <h1 className="display-title-v2 mb-3">{anime.title.english || anime.title.romaji}</h1>
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
                {anime.genres.map(genre => (
                    <span key={genre} className="genre-pill-v2">{genre}</span>
                ))}
            </div>
        </div>

        {/* 5. Overview and Trailer */}
        <div className="overview-container-v2 mb-5">
            <h5 className="section-header-v2">OVERVIEW</h5>
            <div className="description-text-v2" dangerouslySetInnerHTML={{ __html: anime.description }} />
        </div>

        {anime.trailer?.site === 'youtube' && (
            <div className="mb-5">
                <h5 className="section-header-v2">OFFICIAL TRAILER</h5>
                <div className="trailer-box-v2 rounded shadow-lg">
                    <iframe
                        src={`https://www.youtube.com/embed/${anime.trailer.id}`}
                        title="Trailer"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        )}

        {/* Recommendations */}
        {anime.recommendations?.nodes?.length > 0 && (
            <div className="mb-4">
                <h5 className="section-header-v2">SIMILAR ANIME</h5>
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
      </Container>
    </Motion.div>
  );
};

export default AnimeDetails;
