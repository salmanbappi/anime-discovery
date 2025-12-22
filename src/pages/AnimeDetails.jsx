import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import { motion as Motion } from 'framer-motion';
import { fetchAnimeDetails } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import { getProxiedImage } from '../utils/imageHelper';
import { useAuth } from '../context/AuthContext';
import { addBookmark, removeBookmark, isBookmarked } from '../services/bookmarkService';
import { toast } from 'react-toastify';

const AnimeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      const data = await fetchAnimeDetails(id);
      setAnime(data);
      
      if (user && data) {
        const bookmarkedStatus = await isBookmarked(user.id, data.id);
        setBookmarked(bookmarkedStatus);
      }
      
      setLoading(false);
    };
    loadDetails();
  }, [id, user]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.info("Please log in to bookmark anime");
      navigate('/login', { state: { from: { pathname: `/anime/${id}` } } });
      return;
    }

    try {
      if (bookmarked) {
        await removeBookmark(user.id, anime.id);
        setBookmarked(false);
        toast.info("Removed from bookmarks");
      } else {
        await addBookmark(user.id, anime);
        setBookmarked(true);
        toast.success("Added to bookmarks!");
      }
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleDescriptionClick = (e) => {
    const link = e.target.closest('a');
    if (link && link.href) {
      try {
        const url = new URL(link.href);
        if (url.hostname.includes('anilist.co')) {
          e.preventDefault();
          const pathParts = url.pathname.split('/');
          const type = pathParts[1];
          const typeId = pathParts[2];
          
          if (type === 'character' && typeId) {
            navigate(`/character/${typeId}`);
          } else if (type === 'anime' && typeId) {
            navigate(`/anime/${typeId}`);
          } else {
             window.open(link.href, '_blank');
          }
        }
      } catch (err) {
        console.error("Invalid URL", err);
      }
    }
  };

  const getCleanDescription = (desc) => {
    if (!desc) return "";
    // Remove Anilist "Note" sections which are often raw data
    return desc.split(/<br\s*\/?>\s*<br\s*\/?>\s*<b>Note:<\/b>/i)[0];
  };

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
        {/* 1. Cinematic Banner (Visual Hook) */}
        <Motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="top-banner-container mb-4"
        >
            <img 
                src={getProxiedImage(anime.bannerImage || anime.coverImage.extraLarge)} 
                alt="Banner" 
                className="top-banner-img rounded-xl shadow-lg" 
            />
        </Motion.div>

        {/* 2. Title, Genres & Quick Stats */}
        <div className="text-center mt-4 mb-5">
            <h1 className="display-title-v2 mb-3">{anime.title.english || anime.title.romaji}</h1>
            
            {/* Genres */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                {anime.genres.map(genre => (
                    <span key={genre} className="genre-pill-v2">{genre}</span>
                ))}
            </div>

            {/* Quick Stats Badges */}
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-4 align-items-center">
                <span className="badge bg-warning text-dark fs-6 px-3 py-2 rounded-pill">
                    <i className="bi bi-star-fill me-1"></i> {anime.averageScore}%
                </span>
                <span className="badge bg-secondary fs-6 px-3 py-2 rounded-pill">
                    {anime.format}
                </span>
                <span className="badge bg-success fs-6 px-3 py-2 rounded-pill text-uppercase">
                    {anime.status?.replace('_', ' ')}
                </span>
            </div>

            {/* Action: Watch Now & Bookmark */}
            <div className="d-flex flex-wrap justify-content-center gap-3">
                <Button 
                    variant="primary" 
                    size="lg" 
                    className="rounded-pill px-5 py-2 fw-bold shadow-lg"
                    href={`https://hianime.to/search?keyword=${encodeURIComponent((anime.title.english || anime.title.romaji).replace(/[^\w\s]/gi, ' '))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="bi bi-play-circle-fill me-2"></i>Watch Now
                </Button>
                <Button 
                    variant={bookmarked ? "warning" : "outline-light"} 
                    size="lg" 
                    className="rounded-pill px-4 py-2 fw-bold shadow-sm"
                    onClick={handleBookmarkToggle}
                >
                    <i className={`bi bi-bookmark${bookmarked ? '-fill' : ''} me-2`}></i>
                    {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
            </div>
        </div>

        {/* 3. Overview (The "Hook") */}
        <div className="overview-container-v2 mb-5">
            <h5 className="section-header-v2">OVERVIEW</h5>
            <div 
                className="description-text-v2" 
                dangerouslySetInnerHTML={{ __html: getCleanDescription(anime.description) }} 
                onClick={handleDescriptionClick}
            />
        </div>

        {/* 4. Characters (The "Hype") - Moved UP */}
        {anime.characters?.edges?.length > 0 && (
            <div className="mb-5">
                <h5 className="section-header-v2">CHARACTERS</h5>
                <Row className="g-3">
                    {(showAllCharacters ? anime.characters.edges : anime.characters.edges.slice(0, 6)).map(edge => (
                        <Col xs={12} md={6} key={edge.node.id}>
                            <Link to={`/character/${edge.node.id}`} className="text-decoration-none">
                                <div className="char-card-v2">
                                    <img src={getProxiedImage(edge.node.image.medium)} alt={edge.node.name.full} className="char-img-v2" />
                                    <div className="char-info-v2">
                                        <div className="char-name-v2 text-white">{edge.node.name.full}</div>
                                        <div className="char-role-v2">{edge.role}</div>
                                    </div>
                                </div>
                            </Link>
                        </Col>
                    ))}
                </Row>
                {anime.characters.edges.length > 6 && (
                    <div className="text-center mt-3">
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="rounded-pill px-4 text-white"
                            onClick={() => setShowAllCharacters(!showAllCharacters)}
                        >
                            {showAllCharacters ? 'Show Less' : 'Show More'} <i className={`bi bi-chevron-${showAllCharacters ? 'up' : 'down'} ms-1`}></i>
                        </Button>
                    </div>
                )}
            </div>
        )}

        {/* 5. Information Card (The "Details") - Reduced */}
        <div className="info-card-v2 mb-5">
            <h5 className="info-header-v2">DETAILS</h5>
            <div className="info-grid-v2">
                <div className="info-item-v2">
                    <span className="info-label-v2"><i className="bi bi-calendar3 me-2"></i>Released</span>
                    <span className="info-value-v2">{anime.startDate?.year ? `${anime.startDate.day || ''}/${anime.startDate.month || ''}/${anime.startDate.year}` : '?'}</span>
                </div>
                <div className="info-item-v2">
                    <span className="info-label-v2"><i className="bi bi-layers me-2"></i>Episodes</span>
                    <span className="info-value-v2">{anime.episodes || '?'}</span>
                </div>
                <div className="info-item-v2">
                    <span className="info-label-v2"><i className="bi bi-calendar-event me-2"></i>Season</span>
                    <span className="info-value-v2 text-capitalize">{anime.season?.toLowerCase()} {anime.seasonYear}</span>
                </div>
                <div className="info-item-v2 border-0">
                    <span className="info-label-v2"><i className="bi bi-building me-2"></i>Studio</span>
                    <span className="info-value-v2">
                        {anime.studios?.nodes[0] ? (
                            <Link to={`/studio/${anime.studios.nodes[0].id}`} className="text-white text-decoration-none studio-link-hint">
                                {anime.studios.nodes[0].name}
                                <i className="bi bi-info-circle ms-2" style={{ fontSize: '0.8em', opacity: 0.7 }}></i>
                            </Link>
                        ) : '-'}
                    </span>
                </div>
            </div>
        </div>

        {/* 6. Trailer (The "Push") - Moved DOWN */}
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

        {/* 7. Recommendations (The "Next Step") */}
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
