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
  
  // Pagination State
  const [trendingPage, setTrendingPage] = useState(1);
  const [popularPage, setPopularPage] = useState(1);
  const [trendingHasNext, setTrendingHasNext] = useState(false);
  const [popularHasNext, setPopularHasNext] = useState(false);

  const query = searchParams.get('q');
  const isSearching = !!query;

  // Load Data (Trending/Popular) with Pagination
  useEffect(() => {
    const loadData = async () => {
      // Don't reload home data if we are searching
      if (isSearching) return;

      setLoading(true);
      const result = await fetchHomeData(trendingPage, popularPage);
      if (result) {
        setData({
          trending: result.trending.media,
          popular: result.popular.media
        });
        setTrendingHasNext(result.trending.pageInfo.hasNextPage);
        setPopularHasNext(result.popular.pageInfo.hasNextPage);
      }
      setLoading(false);
    };

    loadData();
  }, [trendingPage, popularPage, isSearching]);

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

  const changeTrendingPage = (direction) => {
      const newPage = trendingPage + direction;
      if (newPage >= 1) setTrendingPage(newPage);
  };

  const changePopularPage = (direction) => {
      const newPage = popularPage + direction;
      if (newPage >= 1) setPopularPage(newPage);
  };

  if (loading && !data.trending.length && !isSearching) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Pagination Control Component
  const PaginationControls = ({ page, hasNext, onPrev, onNext }) => (
      <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-sm rounded-circle btn-pagination" 
            onClick={onPrev} 
            disabled={page === 1}
          >
            &lt;
          </button>
          <span className="small" style={{ color: 'var(--color-text)', minWidth: '50px', textAlign: 'center' }}>Page {page}</span>
          <button 
            className="btn btn-sm rounded-circle btn-pagination" 
            onClick={onNext} 
            disabled={!hasNext}
          >
            &gt;
          </button>
      </div>
  );

  return (
    <>
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
                {/* Trending Section */}
                <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="section-title mb-0">Trending Now</h3>
                        <PaginationControls 
                            page={trendingPage} 
                            hasNext={trendingHasNext}
                            onPrev={() => changeTrendingPage(-1)}
                            onNext={() => changeTrendingPage(1)}
                        />
                    </div>
                    {loading && trendingPage !== 1 ? (
                         <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <Row className="g-4">
                            {data.trending.map(anime => (
                            <Col key={anime.id} xs={6} sm={4} md={3} lg={2}>
                                <AnimeCard anime={anime} />
                            </Col>
                            ))}
                        </Row>
                    )}
                </div>

                {/* Popular Section */}
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="section-title mb-0">All Time Popular</h3>
                        <PaginationControls 
                            page={popularPage} 
                            hasNext={popularHasNext}
                            onPrev={() => changePopularPage(-1)}
                            onNext={() => changePopularPage(1)}
                        />
                    </div>
                    {loading && popularPage !== 1 ? (
                        <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <Row className="g-4">
                            {data.popular.map(anime => (
                            <Col key={anime.id} xs={6} sm={4} md={3} lg={2}>
                                <AnimeCard anime={anime} />
                            </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </>
        )}
      </Container>
    </>
  );
};

export default Home;
