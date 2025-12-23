import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Carousel, Form, Dropdown, Button } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchHomeData, searchAnime, fetchAdvancedData } from '../services/api';
import { getBookmarks, removeBookmark } from '../services/bookmarkService';
import { useAuth } from '../context/AuthContext';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import InfiniteScrollGrid from '../components/InfiniteScrollGrid';
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

const SkeletonGrid = () => (
    <Row className="g-3">
        {Array.from({ length: 12 }).map((_, i) => (
            <Col key={i} xs={4} sm={4} md={3} lg={2}>
                <SkeletonCard />
            </Col>
        ))}
    </Row>
);

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState({ trending: [], popular: [], upcoming: [] });
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter & Pagination State from URL
  const selectedGenre = searchParams.get('genre') || '';
  const selectedYear = searchParams.get('year') || '';
  const selectedSeason = searchParams.get('season') || '';
  const selectedSort = searchParams.get('sort') || 'POPULARITY_DESC';
  
  // Internal Page State
  const [trendingPage, setTrendingPage] = useState(1);
  const [popularPage, setPopularPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const filterPage = parseInt(searchParams.get('fp')) || 1;

  const [showFilters, setShowFilters] = useState(false);
  const viewAll = searchParams.get('view'); // 'trending', 'popular', 'upcoming'

  const query = searchParams.get('q');
  const isSearching = !!query;
  const isFiltering = !!(selectedGenre || selectedYear || selectedSeason || selectedSort !== 'POPULARITY_DESC');

  const [trendingHasNext, setTrendingHasNext] = useState(false);
  const [popularHasNext, setPopularHasNext] = useState(false);
  const [upcomingHasNext, setUpcomingHasNext] = useState(false);
  const [filterHasNext, setFilterHasNext] = useState(false);
  const [searchHasNext, setSearchHasNext] = useState(false);

  // Scroll Restoration
  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem('homeScrollPos');
    if (savedScrollPos && !loading && !viewAll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPos));
        sessionStorage.removeItem('homeScrollPos');
      }, 50);
    }
  }, [loading, viewAll]);

  const saveScrollPos = () => {
    sessionStorage.setItem('homeScrollPos', window.scrollY.toString());
  };

  const updateParams = (newParams, options = { replace: true }) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null || (key === 'sort' && value === 'POPULARITY_DESC')) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value.toString());
      }
    });
    setSearchParams(nextParams, { replace: options.replace });
  };

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

  const merge = (oldData, newData) => {
      const ids = new Set(oldData.map(d => d.id));
      return [...oldData, ...newData.filter(d => !ids.has(d.id))];
  };

  const restoreScrollPos = () => {
    const savedScrollPos = sessionStorage.getItem('homeScrollPos');
    if (savedScrollPos) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPos));
        sessionStorage.removeItem('homeScrollPos');
      }, 50);
    }
  };

  // Handle View All changes (User navigated back from View All via hardware button)
  useEffect(() => {
      if (!viewAll) {
          if (trendingPage > 1) setTrendingPage(1);
          if (popularPage > 1) setPopularPage(1);
          if (upcomingPage > 1) setUpcomingPage(1);
          
          if (!loading) restoreScrollPos();
      }
  }, [viewAll, loading]);

  // Load Data (Trending/Popular/Upcoming)
  useEffect(() => {
    const loadData = async () => {
      if (isSearching || isFiltering) return;
      setLoading(true);
      const result = await fetchHomeData(trendingPage, popularPage, upcomingPage);
      if (result) {
        setData(prev => {
            const newData = { ...prev };

            if (trendingPage === 1) newData.trending = result.trending.media;
            else newData.trending = merge(prev.trending, result.trending.media);
            
            if (popularPage === 1) newData.popular = result.popular.media;
            else newData.popular = merge(prev.popular, result.popular.media);

            if (upcomingPage === 1) newData.upcoming = result.upcoming.media;
            else newData.upcoming = merge(prev.upcoming, result.upcoming.media);

            return newData;
        });

        setTrendingHasNext(result.trending.pageInfo.hasNextPage);
        setPopularHasNext(result.popular.pageInfo.hasNextPage);
        setUpcomingHasNext(result.upcoming.pageInfo.hasNextPage);
      }
      setLoading(false);
    };
    loadData();
  }, [trendingPage, popularPage, upcomingPage, isSearching, isFiltering]);

  // Handle Search
  useEffect(() => {
      const performSearch = async () => {
          if (!query) { setSearchResults([]); return; }
          setLoading(true);
          const result = await searchAnime(query, searchPage);
          if (result) {
              setSearchResults(prev => searchPage === 1 ? result.media : merge(prev, result.media));
              setSearchHasNext(result.pageInfo.hasNextPage);
          }
          setLoading(false);
      };
      performSearch();
  }, [query, searchPage]);

  // Reset search page when query changes
  useEffect(() => {
      setSearchPage(1);
  }, [query]);

  // Handle Filters
  useEffect(() => {
      const applyFilters = async () => {
          if (!isFiltering) return;
          setLoading(true);
          const result = await fetchAdvancedData({
              page: filterPage,
              genre: selectedGenre || undefined,
              year: selectedYear ? parseInt(selectedYear) : undefined,
              season: selectedSeason || undefined,
              sort: selectedSort
          });
          if (result) {
              setFilteredData(prev => filterPage === 1 ? result.media : merge(prev, result.media));
              setFilterHasNext(result.pageInfo.hasNextPage);
          }
          setLoading(false);
      };
      applyFilters();
  }, [selectedGenre, selectedYear, selectedSeason, selectedSort, filterPage, isFiltering]);

  const clearFilters = () => {
      setSearchParams(query ? { q: query } : {}, { replace: true });
  };

  const clearSearch = () => setSearchParams({});

  const handleViewAll = (section) => {
      saveScrollPos();
      updateParams({ view: section }, { replace: false });
      window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('view');
      setSearchParams(nextParams, { replace: false }); // or replace: true if you want to replace the history
      // Restore scroll is handled by useEffect when viewAll becomes null
  };

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const renderSection = (title, items, sectionKey, hasNext, page, setPage) => {
      if (!items || items.length === 0) return null;
      
      // If View All is active, only show the active section
      if (viewAll && viewAll !== sectionKey) return null;

      const isViewAllActive = viewAll === sectionKey;

      return (
        <div className="mb-5" id={sectionKey}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    {isViewAllActive && (
                        <Button variant="outline-secondary" size="sm" className="rounded-circle" onClick={handleBackToHome}>
                            <i className="bi bi-arrow-left"></i>
                        </Button>
                    )}
                    <h3 className="section-title mb-0">{title}</h3>
                </div>
                {!isViewAllActive && (
                    <Button variant="link" className="text-decoration-none fw-bold" onClick={() => handleViewAll(sectionKey)}>
                        View All <i className="bi bi-arrow-right"></i>
                    </Button>
                )}
            </div>
            
            {loading && page === 1 ? <SkeletonGrid /> : (
                isViewAllActive ? (
                    <InfiniteScrollGrid 
                        items={items} 
                        hasNext={hasNext} 
                        loading={loading}
                        onLoadMore={() => setPage(prev => prev + 1)}
                        onCardClick={saveScrollPos}
                    />
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" key={`${sectionKey}-${page}`}>
                        <Row className="g-3">
                            {items.map((anime) => (
                                <Col key={anime.id} xs={4} sm={4} md={3} lg={2} as={motion.div} variants={itemVariants}>
                                    <AnimeCard anime={anime} onClick={saveScrollPos} />
                                </Col>
                            ))}
                        </Row>
                    </motion.div>
                )
            )}
        </div>
      );
  };


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {!isSearching && !isFiltering && !viewAll && data.trending.length > 0 && trendingPage === 1 && (
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
                                        <Link to={`/anime/${anime.id}`} onClick={saveScrollPos} className="btn btn-outline-light rounded-pill px-4 py-3 fw-bold backdrop-blur">
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
        {!viewAll && (
            <div className="d-flex justify-content-end mb-3">
                <Button 
                    variant={showFilters || isFiltering ? "primary" : "outline-primary"} 
                    className="rounded-pill px-4 d-flex align-items-center gap-2"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <i className={`bi bi-filter${showFilters ? '-left' : ''}`}></i>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
            </div>
        )}

        {/* Filter Toolbar */}
        <AnimatePresence>
            {(showFilters || isFiltering) && !viewAll && (
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
                                <Form.Select className="border-secondary" value={selectedGenre} onChange={(e) => {updateParams({ genre: e.target.value, fp: 1 });}}>
                                    <option value="">All Genres</option>
                                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                                </Form.Select>
                            </Col>
                            <Col xs={6} md={2}>
                                <Form.Label className="small text-muted">Year</Form.Label>
                                <Form.Select className="border-secondary" value={selectedYear} onChange={(e) => {updateParams({ year: e.target.value, fp: 1 });}}>
                                    <option value="">All Years</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </Form.Select>
                            </Col>
                            <Col xs={6} md={2}>
                                <Form.Label className="small text-muted">Season</Form.Label>
                                <Form.Select className="border-secondary" value={selectedSeason} onChange={(e) => {updateParams({ season: e.target.value, fp: 1 });}}>
                                    <option value="">All Seasons</option>
                                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                                </Form.Select>
                            </Col>
                            <Col xs={6} md={3}>
                                <Form.Label className="small text-muted">Sort By</Form.Label>
                                <Form.Select className="border-secondary" value={selectedSort} onChange={(e) => {updateParams({ sort: e.target.value, fp: 1 });}}>
                                    {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </Form.Select>
                            </Col>
                            <Col xs={12} md={2} className="ms-auto d-flex gap-2">
                                {isFiltering && (
                                    <Button variant="outline-danger" className="w-100 rounded-pill" onClick={clearFilters}>Clear Filters</Button>
                                )}
                            </Col>
                        </Row>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {user && bookmarks.length > 0 && !isSearching && !isFiltering && !viewAll && (
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
                            <Col key={bookmark.id} xs={12} sm={6} md={4} lg={4} as={motion.div} variants={itemVariants}>
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
                                    onClick={saveScrollPos}
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
                </div>
                {loading && filterPage === 1 ? <SkeletonGrid /> : (
                    <InfiniteScrollGrid
                        items={filteredData}
                        hasNext={filterHasNext}
                        loading={loading}
                        onLoadMore={() => updateParams({ fp: filterPage + 1 })}
                        onCardClick={saveScrollPos}
                    />
                )}
            </div>
        ) : isSearching ? (
             <>
             <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title mb-0">Search Results for "{query}"</h3>
                <Button variant="outline-light" size="sm" className="rounded-pill px-3" onClick={clearSearch} style={{ color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>Clear Search</Button>
             </div>
             {loading && searchPage === 1 ? <SkeletonGrid /> : (
                <InfiniteScrollGrid
                    items={searchResults}
                    hasNext={searchHasNext}
                    loading={loading}
                    onLoadMore={() => setSearchPage(prev => prev + 1)}
                    onCardClick={saveScrollPos}
                />
             )}
           </>
        ) : (
            <>
                {renderSection("Trending Now", data.trending, 'trending', trendingHasNext, trendingPage, setTrendingPage)}
                {renderSection("All Time Popular", data.popular, 'popular', popularHasNext, popularPage, setPopularPage)}
                {renderSection("Upcoming Next Season", data.upcoming, 'upcoming', upcomingHasNext, upcomingPage, setUpcomingPage)}
            </>
        )}
      </Container>
    </motion.div>
  );
};

export default Home;
