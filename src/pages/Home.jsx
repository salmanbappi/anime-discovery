import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Carousel } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchHomeData, searchAnime } from '../services/anilist';
import AnimeCard from '../components/AnimeCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0 }
};

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
          <span className="small text-muted" style={{ minWidth: '50px', textAlign: 'center' }}>Page {page}</span>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Carousel Section */}
      {!isSearching && data.trending.length > 0 && trendingPage === 1 && (
        <div className="hero-container mb-5">
          <Carousel fade indicators={true} controls={false} interval={6000}>
            {data.trending.slice(0, 5).map(anime => (
              <Carousel.Item key={anime.id}>
                <div 
                  className="hero-slide" 
                  style={{ backgroundImage: `url(${anime.bannerImage || anime.coverImage.extraLarge})` }}
                >
                  <div className="hero-overlay">
                    <Container>
                      <Row>
                        <Col md={8} lg={6}>
                          <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                          >
                            <span className="badge bg-primary mb-3">Trending #{data.trending.indexOf(anime) + 1}</span>
                            <h1 className="hero-title mb-3">{anime.title.english || anime.title.romaji}</h1>
                            <p className="hero-desc mb-4 d-none d-md-block" dangerouslySetInnerHTML={{ 
                              __html: anime.description?.substring(0, 160) + '...' 
                            }} />
                            <div className="d-flex gap-3">
                              <Link to={`/anime/${anime.id}`} className="btn btn-primary rounded-pill px-4 py-2">Watch Now</Link>
                              <Link to={`/anime/${anime.id}`} className="btn btn-outline-light rounded-pill px-4 py-2">Details</Link>
                            </div>
                          </motion.div>
                        </Col>
                      </Row>
                    </Container>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      )}

      <Container className="pb-5">
        {isSearching ? (
             <>
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title mb-0">Search Results for "{query}"</h3>
                <button className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={clearSearch}>Clear Search</button>
             </div>
             
             {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
             ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <Row className="g-4">
                        {searchResults.length > 0 ? searchResults.map(anime => (
                        <Col key={anime.id} xs={6} sm={4} md={3} lg={2} as={motion.div} variants={itemVariants}>
                            <AnimeCard anime={anime} />
                        </Col>
                        )) : (
                            <p className="text-center text-muted w-100">No results found.</p>
                        )}
                    </Row>
                </motion.div>
             )}
           </>
        ) : (
            <>
                {/* Trending Section */}
                <div className="mb-5" id="trending">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="section-title mb-0">Trending Now</h3>
                        <PaginationControls 
                            page={trendingPage} 
                            hasNext={trendingHasNext}
                            onPrev={() => changeTrendingPage(-1)}
                            onNext={() => changeTrendingPage(1)}
                        />
                    </div>
                    {loading ? (
                         <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            key={`trending-${trendingPage}`}
                        >
                            <Row className="g-4">
                                {data.trending.map(anime => (
                                <Col key={anime.id} xs={6} sm={4} md={3} lg={2} as={motion.div} variants={itemVariants}>
                                    <AnimeCard anime={anime} />
                                </Col>
                                ))}
                            </Row>
                        </motion.div>
                    )}
                </div>

                {/* Popular Section */}
                <div id="popular">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="section-title mb-0">All Time Popular</h3>
                        <PaginationControls 
                            page={popularPage} 
                            hasNext={popularHasNext}
                            onPrev={() => changePopularPage(-1)}
                            onNext={() => changePopularPage(1)}
                        />
                    </div>
                    {loading ? (
                        <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            key={`popular-${popularPage}`}
                        >
                            <Row className="g-4">
                                {data.popular.map(anime => (
                                <Col key={anime.id} xs={6} sm={4} md={3} lg={2} as={motion.div} variants={itemVariants}>
                                    <AnimeCard anime={anime} />
                                </Col>
                                ))}
                            </Row>
                        </motion.div>
                    )}
                </div>
            </>
        )}
      </Container>
    </motion.div>
  );
};

export default Home;
