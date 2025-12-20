import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { fetchHomeData, searchAnime } from '../services/anilist';
import AnimeCard from '../components/AnimeCard';

const Home = () => {
  const [data, setData] = useState({ trending: [], popular: [] });
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get('q');
  const isSearching = !!query;

  // Load Initial Data (Trending/Popular)
  useEffect(() => {
    const loadData = async () => {
      const result = await fetchHomeData();
      if (result) {
        setData({
          trending: result.trending.media,
          popular: result.popular.media
        });
      }
      setLoading(false);
    };

    if (!data.trending.length) {
        loadData();
    }
  }, []);

  // Handle Search when URL query changes
  useEffect(() => {
      const performSearch = async () => {
          if (!query) {
              setSearchResults([]);
              return;
          }
          setLoading(true);
          const results = await searchAnime(query);
          setSearchResults(results);
          setLoading(false);
      };

      performSearch();
  }, [query]);

  const clearSearch = () => {
      setSearchParams({});
  }

  if (loading && !data.trending.length && !isSearching) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      {!isSearching && (
          <div className="hero-section">
            <Container>
              <h2 className="mb-0">Find your next favorite anime</h2>
            </Container>
          </div>
      )}

      <Container className="pb-5 pt-4">
        {isSearching ? (
             <>
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title mb-0">Search Results for "{query}"</h3>
                <button className="btn btn-outline-light btn-sm" onClick={clearSearch}>Clear Search</button>
             </div>
             
             {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
             ) : (
                <Row className="g-4">
                    {searchResults.length > 0 ? searchResults.map(anime => (
                    <Col key={anime.id} xs={6} sm={4} md={3} lg={2}>
                        <AnimeCard anime={anime} />
                    </Col>
                    )) : (
                        <p className="text-center text-muted">No results found.</p>
                    )}
                </Row>
             )}
           </>
        ) : (
            <>
                <div className="mb-5">
                <h3 className="section-title">Trending Now</h3>
                <Row className="g-4">
                    {data.trending.map(anime => (
                    <Col key={anime.id} xs={6} sm={4} md={3} lg={2}>
                        <AnimeCard anime={anime} />
                    </Col>
                    ))}
                </Row>
                </div>

                <div>
                <h3 className="section-title">All Time Popular</h3>
                <Row className="g-4">
                    {data.popular.map(anime => (
                    <Col key={anime.id} xs={6} sm={4} md={3} lg={2}>
                        <AnimeCard anime={anime} />
                    </Col>
                    ))}
                </Row>
                </div>
            </>
        )}
      </Container>
    </>
  );
};

export default Home;
