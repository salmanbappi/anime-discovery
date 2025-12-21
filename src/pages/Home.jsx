import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Carousel, Form, Dropdown, Button } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchHomeData, searchAnime, fetchAdvancedData } from '../services/anilist';
import AnimeCard from '../components/AnimeCard';

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"];
const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"];
const sortOptions = [
    { label: "Popularity", value: "POPULARITY_DESC" },
    { label: "Trending", value: "TRENDING_DESC" },
    { label: "Average Score", value: "SCORE_DESC" },
    { label: "Favorites", value: "FAVOURITES_DESC" },
    { label: "Newest", value: "START_DATE_DESC" },
];

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

const PaginationControls = ({ page, hasNext, onPrev, onNext }) => (
    <div className="d-flex align-items-center gap-3">
        <Button variant="outline-light" size="sm" className="rounded-circle btn-pagination" onClick={onPrev} disabled={page === 1}>&lt;</Button>
        <span className="small fw-bold" style={{ minWidth: '50px', textAlign: 'center', color: 'var(--text-color)' }}>Page {page}</span>
        <Button variant="outline-light" size="sm" className="rounded-circle btn-pagination" onClick={onNext} disabled={!hasNext}>&gt;</Button>
    </div>
);

const Home = () => {
  const [data, setData] = useState({ trending: [], popular: [] });
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter State
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedSort, setSelectedSort] = useState('POPULARITY_DESC');
  const [isFiltering, setIsFiltering] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination State
  const [trendingPage, setTrendingPage] = useState(1);
  const [popularPage, setPopularPage] = useState(1);
  const [filterPage, setFilterPage] = useState(1);
  const [trendingHasNext, setTrendingHasNext] = useState(false);
  const [popularHasNext, setPopularHasNext] = useState(false);
  const [filterHasNext, setFilterHasNext] = useState(false);

  const query = searchParams.get('q');
  const isSearching = !!query;

  // Load Data (Trending/Popular)
  useEffect(() => {
    const loadData = async () => {
      if (isSearching || isFiltering) return;
      setLoading(true);
      const result = await fetchHomeData(trendingPage, popularPage);
      if (result) {
        setData({ trending: result.trending.media, popular: result.popular.media });
        setTrendingHasNext(result.trending.pageInfo.hasNextPage);
        setPopularHasNext(result.popular.pageInfo.hasNextPage);
      }
      setLoading(false);
    };
    loadData();
  }, [trendingPage, popularPage, isSearching, isFiltering]);

  // Handle Search
  useEffect(() => {
      const performSearch = async () => {
          if (!query) { setSearchResults([]); return; }
          setLoading(true);
          const results = await searchAnime(query);
          setSearchResults(results);
          setLoading(false);
      };
      performSearch();
  }, [query]);

  // Handle Filters
  useEffect(() => {
      const applyFilters = async () => {
          if (!selectedGenre && !selectedYear && !selectedSeason && selectedSort === 'POPULARITY_DESC') {
              setIsFiltering(false);
              return;
          }
          setIsFiltering(true);
          setLoading(true);
          const result = await fetchAdvancedData({
              page: filterPage,
              genre: selectedGenre || undefined,
              year: selectedYear ? parseInt(selectedYear) : undefined,
              season: selectedSeason || undefined,
              sort: selectedSort
          });
          if (result) {
              setFilteredData(result.media);
              setFilterHasNext(result.pageInfo.hasNextPage);
          }
          setLoading(false);
      };
      applyFilters();
  }, [selectedGenre, selectedYear, selectedSeason, selectedSort, filterPage]);

  const clearFilters = () => {
      setSelectedGenre('');
      setSelectedYear('');
      setSelectedSeason('');
      setSelectedSort('POPULARITY_DESC');
      setFilterPage(1);
      setIsFiltering(false);
  };

  const clearSearch = () => setSearchParams({});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {!isSearching && !isFiltering && data.trending.length > 0 && trendingPage === 1 && (
        <div className="hero-container mb-4">
            {/* Hero Carousel remains here */}
            <Carousel fade indicators={true} controls={false} interval={6000}>
            {data.trending.slice(0, 5).map(anime => (
              <Carousel.Item key={anime.id}>
                <div className="hero-slide" style={{ backgroundImage: `url(${anime.bannerImage || anime.coverImage.extraLarge})` }}>
                  <div className="hero-overlay">
                    <Container>
                      <Row>
                        <Col md={8} lg={6}>
                          <motion.div 
                            initial={{ x: -30, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-center text-md-start"
                          >
                            <span className="badge bg-transparent border border-white text-white mb-3">Trending Now</span>
                            <h1 className="hero-title mb-3">{anime.title.english || anime.title.romaji}</h1>
                            <p className="hero-desc mb-4 d-none d-md-block mx-auto mx-md-0" style={{ fontSize: '1rem', opacity: 0.8 }} dangerouslySetInnerHTML={{ __html: anime.description?.substring(0, 160) + '...' }} />
                            <div className="d-flex gap-3 justify-content-center justify-content-md-start">
                              <Link to={`/anime/${anime.id}`} className="btn btn-primary rounded-pill px-4 fw-bold">Watch Now</Link>
                              <Link to={`/anime/${anime.id}`} className="btn btn-outline-light rounded-pill px-4 fw-bold">Details</Link>
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

      <Container className="py-4">
        {/* Filter Toggle Button */}
        <div className="d-flex justify-content-end mb-3">
            <Button 
                variant={showFilters ? "primary" : "outline-primary"} 
                className="rounded-pill px-4 d-flex align-items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
            >
                <i className={`bi bi-filter${showFilters ? '-left' : ''}`}></i>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
        </div>

        {/* Filter Toolbar */}
        <AnimatePresence>
            {showFilters && (
                <motion.div 
                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginBottom: '3rem' }}
                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: 'hidden' }}
                >
                    <div className="filter-toolbar rounded shadow-sm">
                        <Row className="g-3 align-items-end">
                            <Col xs={12} md={3}>
                                <Form.Label className="small text-muted">Genre</Form.Label>
                                <Form.Select className="border-secondary" value={selectedGenre} onChange={(e) => {setSelectedGenre(e.target.value); setFilterPage(1);}}>
                                    <option value="">All Genres</option>
                                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                                </Form.Select>
                            </Col>
                            <Col xs={6} md={2}>
                                <Form.Label className="small text-muted">Year</Form.Label>
                                <Form.Select className="border-secondary" value={selectedYear} onChange={(e) => {setSelectedYear(e.target.value); setFilterPage(1);}}>
                                    <option value="">All Years</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </Form.Select>
                            </Col>
                            <Col xs={6} md={2}>
                                <Form.Label className="small text-muted">Season</Form.Label>
                                <Form.Select className="border-secondary" value={selectedSeason} onChange={(e) => {setSelectedSeason(e.target.value); setFilterPage(1);}}>
                                    <option value="">All Seasons</option>
                                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                                </Form.Select>
                            </Col>
                            <Col xs={6} md={3}>
                                <Form.Label className="small text-muted">Sort By</Form.Label>
                                <Form.Select className="border-secondary" value={selectedSort} onChange={(e) => {setSelectedSort(e.target.value); setFilterPage(1);}}>
                                    {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </Form.Select>
                            </Col>
                            <Col xs={12} md={2} className="ms-auto d-flex gap-2">
                                {(selectedGenre || selectedYear || selectedSeason || selectedSort !== 'POPULARITY_DESC') && (
                                    <Button variant="outline-danger" className="w-100 rounded-pill" onClick={clearFilters}>Clear</Button>
                                )}
                            </Col>
                        </Row>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {isFiltering ? (
            <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="section-title mb-0">Filtered Results</h3>
                    <PaginationControls page={filterPage} hasNext={filterHasNext} onPrev={() => setFilterPage(p => p - 1)} onNext={() => setFilterPage(p => p + 1)} />
                </div>
                {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" key={`filter-${filterPage}`}>
                        <Row className="g-4">
                            {filteredData.map(anime => (
                                <Col key={anime.id} xs={6} sm={4} md={3} lg={2} as={motion.div} variants={itemVariants}>
                                    <AnimeCard anime={anime} />
                                </Col>
                            ))}
                        </Row>
                    </motion.div>
                )}
            </div>
        ) : isSearching ? (
             <>
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title mb-0">Search Results for "{query}"</h3>
                <Button variant="outline-light" size="sm" className="rounded-pill px-3" onClick={clearSearch} style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>Clear Search</Button>
             </div>
             {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                    <Row className="g-4">
                        {searchResults.length > 0 ? searchResults.map(anime => (
                        <Col key={anime.id} xs={6} sm={4} md={3} lg={2} as={motion.div} variants={itemVariants}>
                            <AnimeCard anime={anime} />
                        </Col>
                        )) : <p className="text-center w-100" style={{ color: 'var(--text-muted)' }}>No results found.</p>}
                    </Row>
                </motion.div>
             )}
           </>
        ) : (
            <>
                <div className="mb-5" id="trending">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="section-title mb-0">Trending Now</h3>
                        <PaginationControls page={trendingPage} hasNext={trendingHasNext} onPrev={() => setTrendingPage(p => p - 1)} onNext={() => setTrendingPage(p => p + 1)} />
                    </div>
                    {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show" key={`trending-${trendingPage}`}>
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

                <div id="popular">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="section-title mb-0">All Time Popular</h3>
                        <PaginationControls page={popularPage} hasNext={popularHasNext} onPrev={() => setPopularPage(p => p - 1)} onNext={() => setPopularPage(p => p + 1)} />
                    </div>
                    {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
                        <motion.div variants={containerVariants} initial="hidden" animate="show" key={`popular-${popularPage}`}>
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
