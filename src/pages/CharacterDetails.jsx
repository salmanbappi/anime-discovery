import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { motion as Motion } from 'framer-motion';
import { fetchCharacterDetails } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import { getProxiedImage } from '../utils/imageHelper';

const CharacterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      const data = await fetchCharacterDetails(parseInt(id));
      setCharacter(data);
      setLoading(false);
    };
    loadDetails();
  }, [id]);

  const handleDescriptionClick = (e) => {
    const link = e.target.closest('a');
    if (link && link.href) {
      try {
        const url = new URL(link.href);
        if (url.hostname.includes('anilist.co')) {
          e.preventDefault();
          const pathParts = url.pathname.split('/');
          // pathParts usually ["", "character", "123", "Name"]
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
        console.error("Invalid URL in description", err);
      }
    }
  };

  const getCleanDescription = (desc) => {
    if (!desc) return "";
    return desc.split(/<br\s*\/?>\s*<br\s*\/?>\s*<b>Note:<\/b>/i)[0];
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!character) {
    return (
      <Container className="text-center py-5 text-white">
        <h3>Character not found</h3>
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
      <Container className="py-5">
        <Row className="mb-5">
            <Col md={4} lg={3} className="text-center text-md-start mb-4 mb-md-0">
                 <Motion.img 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={character.image.large} 
                    alt={character.name.full} 
                    className="img-fluid rounded shadow-lg"
                    referrerPolicy="no-referrer"
                    style={{ maxWidth: '100%', borderRadius: '15px' }}
                />
            </Col>
            <Col md={8} lg={9}>
                 <h1 className="display-4 fw-bold text-white mb-3">{character.name.full}</h1>
                 {character.name.native && <h4 className="text-white-50 mb-3">{character.name.native}</h4>}
                 
                 <div className="d-flex flex-wrap gap-3 mb-4">
                    {character.gender && (
                        <span className="badge bg-secondary fs-6">Gender: {character.gender}</span>
                    )}
                     {character.bloodType && (
                        <span className="badge bg-secondary fs-6">Blood Type: {character.bloodType}</span>
                    )}
                    {character.age && (
                         <span className="badge bg-secondary fs-6">Age: {character.age}</span>
                    )}
                 </div>

                 <div 
                    className="description-text-v2" 
                    dangerouslySetInnerHTML={{ __html: getCleanDescription(character.description) }}
                    onClick={handleDescriptionClick}
                    style={{ 
                        maxHeight: expanded ? 'none' : '150px', 
                        overflow: 'hidden',
                        maskImage: expanded ? 'none' : 'linear-gradient(to bottom, black 60%, transparent 100%)',
                        WebkitMaskImage: expanded ? 'none' : 'linear-gradient(to bottom, black 60%, transparent 100%)',
                        transition: 'all 0.3s ease'
                    }}
                 />
                 {character.description && character.description.length > 300 && (
                    <div 
                        className="text-primary mt-2 fw-bold" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'Read Less' : 'Read More'}
                    </div>
                 )}
            </Col>
        </Row>

        {character.media?.nodes?.length > 0 && (
            <div className="mb-5">
                <h3 className="section-header-v2 mb-4">RELATED ANIME</h3>
                <Row className="g-3">
                    {character.media.nodes.map(anime => (
                        <Col xs={6} sm={4} md={3} lg={2} key={anime.id}>
                            <AnimeCard anime={anime} />
                        </Col>
                    ))}
                </Row>
            </div>
        )}
      </Container>
    </Motion.div>
  );
};

export default CharacterDetails;
