import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';
import { motion as Motion } from 'framer-motion';
import { fetchAnimeDetails } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import { getProxiedImage } from '../utils/imageHelper';
import { useAuth } from '../context/AuthContext';
import { addBookmark, removeBookmark, getBookmarkStatus } from '../services/bookmarkService';
import { toast } from 'react-toastify';
import { Dropdown, ButtonGroup } from 'react-bootstrap';

const statuses = [
  { label: 'Watching', color: 'success' },
  { label: 'Completed', color: 'primary' },
  { label: 'On hold', color: 'warning' },
  { label: 'Dropped', color: 'danger' },
  { label: 'Plan to watch', color: 'info' },
  { label: 'Rewatching', color: 'secondary' }
];

const AnimeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [watchUrl, setWatchUrl] = useState(null);

  // Generate AnimeKai Watch URL
  useEffect(() => {
    if (anime) {
      const title = anime.title.english || anime.title.romaji;
      // Generate slug: lowercase, replace non-alphanumeric with hyphens, remove multiple hyphens
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Try to construct a direct link to episode 1 on AnimeKai
      // Most common pattern: https://animekai.to/watch/[slug]-episode-1
      setWatchUrl(`https://animekai.to/watch/${slug}-episode-1`);
    }
  }, [anime]);

  // Scroll Restoration
  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem(`animeScrollPos_${id}`);
    if (savedScrollPos && !loading) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPos));
        sessionStorage.removeItem(`animeScrollPos_${id}`);
      }, 100);
    }
  }, [loading, id]);

  const saveScrollPos = () => {
    sessionStorage.setItem(`animeScrollPos_${id}`, window.scrollY.toString());
  };

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      setLoading(true);
      
      try {
        const animeId = parseInt(id);
        // Parallelize fetchAnimeDetails and getBookmarkStatus
        const [animeData, bookmarkRes] = await Promise.all([
          fetchAnimeDetails(animeId),
          user ? getBookmarkStatus(user.id, animeId) : Promise.resolve({ data: null })
        ]);

        if (isMounted) {
          setAnime(animeData);
          if (bookmarkRes && bookmarkRes.data) {
            setCurrentStatus(bookmarkRes.data.status);
          } else {
            setCurrentStatus(null);
          }
        }
      } catch (err) {
        console.error("Error loading anime details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!authLoading) {
      loadDetails();
    }

    return () => { isMounted = false; };
  }, [id, user, authLoading]);

  const handleStatusChange = async (newStatus) => {
    if (!user) {
      toast.info("Please log in to set status");
      navigate('/login', { state: { from: { pathname: `/anime/${id}` } } });
      return;
    }

    try {
      const { error } = await addBookmark(user.id, anime, newStatus);
      if (error) throw error;
      
      setCurrentStatus(newStatus);
      toast.success(`Set to ${newStatus}`);
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(`Failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleRemoveBookmark = async () => {
    if (!user) return;
    try {
      const { error } = await removeBookmark(user.id, anime.id);
      if (error) throw error;
      
      setCurrentStatus(null);
      toast.info("Removed from list");
    } catch (err) {
      console.error("Remove bookmark error:", err);
      toast.error("Failed to remove");
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
    return desc.split(/<br\s*\/?>\s*<br\s*\/?>\s*<b>Note:<\/b>/i)[0];
  };

  if (authLoading || loading) {
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
        {/* Cinematic Banner */}
        <Motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="top-banner-container mb-4"
        >
            <img 
                src={getProxiedImage(anime.bannerImage || anime.coverImage.extraLarge)} 
                alt="Banner" 
                className="top-banner-img rounded-xl shadow-lg" 
                referrerPolicy="no-referrer"
            />
        </Motion.div>

        {/* Title, Genres & Quick Stats */}
        <div className="text-center mt-4 mb-5 details-header-section">
            <h1 className="display-title-v2 mb-3 text-uppercase">{anime.title.english || anime.title.romaji}</h1>
            
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-4">
                <div className="d-flex flex-wrap gap-2">
                    {anime.genres.map(genre => (
                        <span key={genre} className="genre-pill-v2">{genre}</span>
                    ))}
                </div>

                <div className="vr d-none d-md-block bg-secondary mx-2" style={{ height: '30px', opacity: 0.3 }}></div>

                <div className="d-flex gap-3 align-items-center">
                    <span className="stat-item-v2">
                        <i className="bi bi-star-fill text-warning me-1"></i> {anime.averageScore}%
                    </span>
                    <span className="stat-item-v2">
                        {anime.format}
                    </span>
                    <span className="stat-item-v2 text-uppercase text-success">
                        {anime.status?.replace('_', ' ')}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-3 action-buttons-v2">
                <Button 
                    variant="primary" 
                    className="action-btn-main rounded-pill px-5 fw-bold"
                    href={watchUrl || `https://animekai.to/search?keyword=${encodeURIComponent((anime.title.english || anime.title.romaji).replace(/[^\w\s]/gi, ' '))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="bi bi-play-circle-fill me-2"></i>WATCH NOW
                </Button>
                
                <div className="d-flex gap-2">
                    <Dropdown as={ButtonGroup} className="status-dropdown-v2 rounded-pill shadow-sm">
                        {!currentStatus ? (
                            <>
                                <Button 
                                    variant="outline-light" 
                                    className="px-4 fw-bold border-end-0"
                                    onClick={() => handleStatusChange('Plan to watch')}
                                >
                                    <i className="bi bi-bookmark-plus me-2"></i>
                                    BOOKMARK
                                </Button>
                                <Dropdown.Toggle 
                                    split 
                                    variant="outline-light" 
                                    className="px-3"
                                />
                            </>
                        ) : (
                            <Dropdown.Toggle 
                                variant={statuses.find(s => s.label === currentStatus)?.color || "success"} 
                                className="px-4 fw-bold rounded-pill"
                            >
                                <i className="bi bi-check-circle-fill me-2"></i>
                                {currentStatus.toUpperCase()}
                            </Dropdown.Toggle>
                        )}

                        <Dropdown.Menu variant="dark" className="shadow-lg border-secondary py-0 overflow-hidden">
                            <div className="dropdown-header-custom">SET STATUS</div>
                            {statuses.map(s => (
                                <Dropdown.Item 
                                    key={s.label} 
                                    onClick={() => handleStatusChange(s.label)}
                                    className={`py-2 px-4 ${currentStatus === s.label ? 'bg-primary text-white' : ''}`}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className={`status-dot bg-${s.color} me-3`}></div>
                                        {s.label}
                                    </div>
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>

                    {currentStatus && (
                        <Button 
                            variant="outline-danger" 
                            className="rounded-pill px-3 fw-bold"
                            onClick={handleRemoveBookmark}
                            title="Remove Bookmark"
                        >
                            <i className="bi bi-trash-fill"></i>
                        </Button>
                    )}
                </div>
            </div>
        </div>

        {/* Overview */}
        <div className="overview-container-v2 mb-5">
            <h5 className="section-header-v2">OVERVIEW</h5>
            <div 
                className="description-text-v2" 
                dangerouslySetInnerHTML={{ __html: getCleanDescription(anime.description) }} 
                onClick={handleDescriptionClick}
            />
        </div>

        {/* Characters */}
        {anime.characters?.edges?.length > 0 && (
            <div className="mb-5">
                <h5 className="section-header-v2">CHARACTERS</h5>
                <Row className="g-3">
                    {(showAllCharacters ? anime.characters.edges : anime.characters.edges.slice(0, 6)).map(edge => (
                        <Col xs={12} md={6} key={edge.node.id}>
                            <Link to={`/character/${edge.node.id}`} className="text-decoration-none" onClick={saveScrollPos}>
                                <div className="char-card-v2">
                                    <img 
                                        src={getProxiedImage(edge.node.image.medium)} 
                                        alt={edge.node.name.full} 
                                        className="char-img-v2" 
                                        referrerPolicy="no-referrer"
                                    />
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
                            onClick={() => { saveScrollPos(); setShowAllCharacters(!showAllCharacters); }}
                        >
                            {showAllCharacters ? 'Show Less' : 'Show More'} <i className={`bi bi-chevron-${showAllCharacters ? 'up' : 'down'} ms-1`}></i>
                        </Button>
                    </div>
                )}
            </div>
        )}

        {/* Information Card */}
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
                            <Link to={`/studio/${anime.studios.nodes[0].id}`} className="text-white text-decoration-none studio-link-hint" onClick={saveScrollPos}>
                                {anime.studios.nodes[0].name}
                                <i className="bi bi-info-circle ms-2" style={{ fontSize: '0.8em', opacity: 0.7 }}></i>
                            </Link>
                        ) : '-'}
                    </span>
                </div>
            </div>
        </div>

        {/* Trailer */}
        {anime.trailer?.site === 'youtube' && (
            <div className="mb-5">
                <h5 className="section-header-v2">OFFICIAL TRAILER</h5>
                <div className="trailer-box-v2 rounded shadow-lg overflow-hidden">
                    <iframe
                        src={`https://www.youtube.com/embed/${anime.trailer.id}?rel=0`}
                        title="Trailer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                                <AnimeCard anime={rec.mediaRecommendation} onClick={saveScrollPos} />
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