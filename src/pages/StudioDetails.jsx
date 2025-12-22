import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Form, Button } from 'react-bootstrap';
import { motion as Motion } from 'framer-motion';
import { fetchStudioDetails } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import InfiniteScrollGrid from '../components/InfiniteScrollGrid';

const StudioDetails = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [studio, setStudio] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const sort = searchParams.get('sort') || 'POPULARITY_DESC';

  // Scroll Restoration
  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem(`studioScrollPos_${id}`);
    if (savedScrollPos && !loading) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPos));
        sessionStorage.removeItem(`studioScrollPos_${id}`);
      }, 100);
    }
  }, [loading, id]);

  const saveScrollPos = () => {
    sessionStorage.setItem(`studioScrollPos_${id}`, window.scrollY.toString());
  };

  const merge = (oldData, newData) => {
      const ids = new Set(oldData.map(d => d.id));
      return [...oldData, ...newData.filter(d => !ids.has(d.id))];
  };

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      const data = await fetchStudioDetails({ id: parseInt(id), sort, page });
      if (data) {
          setStudio(prev => ({ ...prev, ...data, media: undefined })); // Keep studio info, media handled separately
          setMediaList(prev => page === 1 ? data.media.nodes : merge(prev, data.media.nodes));
          setHasNextPage(data.media.pageInfo.hasNextPage);
      }
      setLoading(false);
    };
    loadDetails();
  }, [id, sort, page]);

  // Reset page and list when sort changes or id changes
  useEffect(() => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (page !== 1) setPage(1);
      setMediaList([]);
  }, [id, sort]);

  const handleSortChange = (e) => {
    setSearchParams({ sort: e.target.value });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  if (loading && page === 1) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!studio && !loading) {
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
             <h1 className="display-4 fw-bold text-white mb-0">{studio?.name || 'Studio'}</h1>
             <div className="d-flex gap-2 align-items-center">
                {sort !== 'POPULARITY_DESC' && (
                    <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={clearFilters}>
                        Clear
                    </Button>
                )}
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
        </div>

        <InfiniteScrollGrid
            items={mediaList}
            hasNext={hasNextPage}
            loading={loading}
            onLoadMore={() => setPage(prev => prev + 1)}
            onCardClick={saveScrollPos}
        />
      </Container>
    </Motion.div>
  );
};

export default StudioDetails;
