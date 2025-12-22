import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import { motion as Motion } from 'framer-motion';
import { fetchStudioDetails } from '../services/api';
import AnimeCard from '../components/AnimeCard';

const StudioDetails = () => {
  const { id } = useParams();
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('POPULARITY_DESC');

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      const data = await fetchStudioDetails({ id: parseInt(id), sort });
      setStudio(data);
      setLoading(false);
    };
    loadDetails();
  }, [id, sort]);

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!studio) {
    return (
      <Container className="text-center py-5 text-white">
        <h3>Studio not found</h3>
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
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
             <h1 className="display-4 fw-bold text-white mb-0">{studio.name}</h1>
             <Form.Select 
                aria-label="Sort Anime" 
                className="w-auto bg-dark text-white border-secondary"
                value={sort}
                onChange={handleSortChange}
            >
                <option value="POPULARITY_DESC">Most Popular</option>
                <option value="SCORE_DESC">Top Scored</option>
                <option value="START_DATE_DESC">Newest / To Be Aired</option>
                <option value="START_DATE">Oldest Release</option>
            </Form.Select>
        </div>

        {studio.media?.nodes?.length > 0 ? (
            <Row className="g-3">
                {studio.media.nodes.map(anime => (
                    <Col xs={6} sm={4} md={3} lg={2} key={anime.id}>
                        <AnimeCard anime={anime} />
                    </Col>
                ))}
            </Row>
        ) : (
            <p className="text-white-50">No anime found for this studio.</p>
        )}
      </Container>
    </Motion.div>
  );
};

export default StudioDetails;
