import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Carousel, Form, Dropdown, Button } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchHomeData, searchAnime, fetchAdvancedData } from '../services/api';
import { getBookmarks, removeBookmark } from '../services/bookmarkService';
import { useAuth } from '../context/AuthContext';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import { getProxiedImage } from '../utils/imageHelper';
import { toast } from 'react-toastify';

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

const SkeletonGrid = () => (
    <Row className="g-4">
        {Array.from({ length: 12 }).map((_, i) => (
            <Col key={i} xs={6} sm={4} md={3} lg={2}>
                <SkeletonCard />
            </Col>
        ))}
    </Row>
);

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState({ trending: [], popular: [] });
  const [bookmarks, setBookmarks] = useState([]);
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

  const handleRemove = async (animeId) => {
    try {
      const { error } = await removeBookmark(user.id, animeId);
      if (error) throw error;
      setBookmarks(bookmarks.filter(b => b.anime_id !== animeId));
      toast.info("Removed from bookmarks");
    } catch (err) {
      console.error("Error removing bookmark:", err);
      toast.error("Failed to remove bookmark");
    }
  };

  // Load Bookmarks
  useEffect(() => {
    if (user) {
      const loadBookmarks = async () => {
        const { data: bookmarkData } = await getBookmarks(user.id);
        if (bookmarkData) setBookmarks(bookmarkData.slice(0, 6));
      };
      loadBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [user]);

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

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {!isSearching && !isFiltering && data.trending.length > 0 && trendingPage === 1 && (
        <div className="hero-container mb-2">
            {/* Hero Carousel */}
                        <Carousel fade indicators={true} controls={false} interval={6000}>
                        {data.trending.slice(0, 5).map((anime, index) => (
                          <Carousel.Item key={anime.id}>
                                            <div className="hero-slide" style={{ overflow: 'hidden', position: 'relative', height: '65vh' }}>
                                              <div 
                                                className="hero-bg-image-wrapper"
                                                style={{
                                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                    backgroundImage: `url(${getProxiedImage(anime.coverImage.extraLarge)})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    filter: 'brightness(1.1) contrast(1.1)',
                                                    zIndex: 0
                                                }}
                                              ></div>                              
                              {/* Bottom Half Gradient Overlay */}
                              <div className="hero-overlay-bottom" style={{ 
                                  position: 'absolute', 
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: '100%', 
                                  zIndex: 1, 
                                  background: 'linear-gradient(to top, #000000 0%, rgba(0,0,0,0.6) 40%, transparent 60%), linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 100%)',
                              }}></div>
            
                              {/* Content */}
                              <Container className="h-100" style={{ position: 'relative', zIndex: 2 }}>
                                <Row className="align-items-center h-100 py-5">
                                  {/* Poster Column */}
                                  <Col md={4} lg={3} className="d-none d-md-block text-center">
                                      <motion.img 
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ duration: 0.5, delay: 0.2 }}
                                          src={getProxiedImage(anime.coverImage.extraLarge)} 
                                          alt={anime.title.english}
                                          className="img-fluid rounded shadow-lg"
                                          referrerPolicy="no-referrer"
                                          style={{ 
                                              maxHeight: '400px', 
                                              width: 'auto',
                                              objectFit: 'cover', 
                                              borderRadius: '12px',
                                              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                                              border: '1px solid rgba(255,255,255,0.1)'
                                          }}
                                      />
                                  </Col>
            
                                  {/* Text Column */}
                                  <Col md={8} lg={9}>
                                    <motion.div 
                                      initial={{ y: 20, opacity: 0 }} 
                                      animate={{ y: 0, opacity: 1 }} 
                                      transition={{ duration: 0.6, delay: 0.3 }}
                                      className="text-center text-md-start ps-md-4"
                                    >
                                       <div className="d-flex align-items-center gap-2 mb-3 justify-content-center justify-content-md-start flex-wrap">
                                            <span className="badge bg-primary rounded-pill px-3 py-2 fw-bold">#{index + 1} Trending</span>
                                            <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-bold">★ {anime.averageScore}%</span>
                                        </div>
                                      
                                      <h1 className="hero-title mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: '900', textShadow: '2px 2px 10px rgba(0,0,0,0.7)', lineHeight: 1.1 }}>
                                          {anime.title.english || anime.title.romaji}
                                      </h1>
            
                                      <div 
                                          className="hero-desc mb-4 d-none d-md-block text-white" 
                                          style={{ 
                                              fontSize: '1.05rem', 
                                              lineHeight: '1.6', 
                                              maxWidth: '700px',
                                              display: '-webkit-box',
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: 'vertical',
                                              overflow: 'hidden',
                                              opacity: 0.95
                                          }} 
                                          dangerouslySetInnerHTML={{ __html: anime.description }} 
                                      />
                                      
                                      <div className="d-flex gap-3 justify-content-center justify-content-md-start pt-2">
                                        {anime.trailer?.site === 'youtube' && (
                                            <a 
                                              href={`https://www.youtube.com/watch?v=${anime.trailer.id}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-lg d-flex align-items-center gap-2"
                                            >
                                                <i className="bi bi-youtube fs-4"></i> Trailer
                                            </a>
                                        )}
                                        <Link to={`/anime/${anime.id}`} className="btn btn-outline-light rounded-pill px-4 py-3 fw-bold backdrop-blur">
                                            Details
                                        </Link>
                                      </div>
                                    </motion.div>
                                  </Col>
                                </Row>
                              </Container>
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

        {user && bookmarks.length > 0 && !isSearching && !isFiltering && (
            <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="section-title mb-0">Recently Bookmarked</h3>
                    <Link to="/bookmarks" className="btn btn-link text-decoration-none p-0" style={{ color: 'var(--primary-color)' }}>
                        View All <i className="bi bi-chevron-right small"></i>
                    </Link>
                </div>
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                    <Row className="g-4">
                        {bookmarks.map(bookmark => (
                            <Col key={bookmark.id} xs={6} sm={4} md={3} lg={2} as={motion.div} variants={itemVariants}>
                                <AnimeCard 
                                    anime={{
                                        id: bookmark.anime_id,
                                        title: { english: bookmark.anime_title },
                                        coverImage: { large: bookmark.anime_image },
                                        averageScore: bookmark.anime_score,
                                        format: bookmark.anime_format,
                                        status_label: bookmark.status
                                    }} 
                                    onRemove={handleRemove}
                                />
                            </Col>
                        ))}
                    </Row>
                </motion.div>
            </div>
        )}

        {isFiltering ? (
            <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="section-title mb-0">Filtered Results</h3>
                    <PaginationControls page={filterPage} hasNext={filterHasNext} onPrev={() => setFilterPage(p => p - 1)} onNext={() => setFilterPage(p => p + 1)} />
                </div>
                {loading ? <SkeletonGrid /> : (
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
             {loading ? <SkeletonGrid /> : (
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
                    {loading ? <SkeletonGrid /> : (
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
                    {loading ? <SkeletonGrid /> : (
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
