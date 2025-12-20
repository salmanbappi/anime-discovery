import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import { fetchHomeData, searchAnime } from '../services/anilist';
import AnimeCard from '../components/AnimeCard';

const Home = () => {
  const [data, setData] = useState({ trending: [], popular: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

    loadData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setLoading(true);
    const results = await searchAnime(searchQuery);
    setSearchResults(results);
    setLoading(false);
  };

  const clearSearch = () => {
      setIsSearching(false);
      setSearchQuery('');
      setSearchResults([]);
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
      <div className="hero-section">
        <Container>
          <h2 className="mb-4">Find your next favorite anime</h2>
          <div className="d-flex justify-content-center">
             <Form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '500px' }}>
                <Form.Control 
                    type="text" 
                    placeholder="Search for an anime..." 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
             </Form>
          </div>
          {isSearching && (
              <button className="btn btn-link text-white mt-2" onClick={clearSearch}>Back to Home</button>
          )}
        </Container>
      </div>

      <Container className="pb-5">
        {isSearching ? (
             <>
             <h3 className="section-title">Search Results</h3>
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
