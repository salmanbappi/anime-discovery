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
  const { user } = useAuth();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      const data = await fetchAnimeDetails(id);
      setAnime(data);
      
      if (user && data) {
        const { data: bData } = await getBookmarkStatus(user.id, data.id);
        if (bData) {
          setCurrentStatus(bData.status);
        } else {
          setCurrentStatus(null);
        }
      }
      
      setLoading(false);
    };
    loadDetails();
  }, [id, user]);

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
      toast.error("Failed to update status");
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
        <div className="text-center mt-4 mb-5 details-header-section">
            <h1 className="display-title-v2 mb-3 text-uppercase">{anime.title.english || anime.title.romaji}</h1>
            
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-4">
                {/* Genres */}
                <div className="d-flex flex-wrap gap-2">
                    {anime.genres.map(genre => (
                        <span key={genre} className="genre-pill-v2">{genre}</span>
                    ))}
                </div>

                <div className="vr d-none d-md-block bg-secondary mx-2" style={{ height: '30px', opacity: 0.3 }}></div>

                {/* Quick Stats Badges */}
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

            {/* Action: Watch Now & Status */}
            <div className="d-flex flex-wrap justify-content-center gap-3 action-buttons-v2">
                <Button 
                    variant="primary" 
                    className="action-btn-main rounded-pill px-5 fw-bold"
                    href={`https://hianime.to/search?keyword=${encodeURIComponent((anime.title.english || anime.title.romaji).replace(/[^\w\s]/gi, ' '))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="bi bi-play-circle-fill me-2"></i>WATCH NOW
                </Button>
                
                <Dropdown as={ButtonGroup} className="status-dropdown-v2 rounded-pill shadow-sm overflow-hidden">
                    <Button 
                        variant={currentStatus ? statuses.find(s => s.label === currentStatus)?.color : "outline-light"} 
                        className="px-4 fw-bold border-end-0"
                    >
                        <i className={`bi bi-${currentStatus ? 'check-circle-fill' : 'bookmark-plus'} me-2`}></i>
                        {currentStatus || 'BOOKMARK'}
                    </Button>

                    <Dropdown.Toggle 
                        split 
                        variant={currentStatus ? statuses.find(s => s.label === currentStatus)?.color : "outline-light"} 
                        className="px-3"
                    />

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
                        {currentStatus && (
                            <>
                                <Dropdown.Divider className="m-0 bg-secondary" style={{ opacity: 0.1 }} />
                                <Dropdown.Item onClick={handleRemoveBookmark} className="text-danger py-2 px-4 hover-danger">
                                    <i className="bi bi-x-circle me-3"></i>REMOVE
                                </Dropdown.Item>
                            </>
                        )}
                    </Dropdown.Menu>
                </Dropdown>
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
