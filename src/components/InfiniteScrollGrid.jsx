import React, { useRef, useCallback } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import AnimeCard from './AnimeCard';
import SkeletonCard from './SkeletonCard';

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

const InfiniteScrollGrid = ({ items, hasNext, onLoadMore, loading, onCardClick }) => {
    const observer = useRef();
    
    const lastElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNext) {
                onLoadMore();
            }
        }, { rootMargin: '200px' });
        
        if (node) observer.current.observe(node);
    }, [loading, hasNext, onLoadMore]);

    // Ensure we don't have duplicate keys
    const uniqueItems = Array.from(new Map(items.map(item => [item.id, item])).values());

    return (
        <>
            <motion.div 
                initial="hidden" 
                animate="show" 
                variants={{
                    show: { transition: { staggerChildren: 0.05 } }
                }}
            >
                <Row className="g-3">
                    {uniqueItems.map((anime, index) => {
                        if (uniqueItems.length === index + 1) {
                            return (
                                <Col ref={lastElementRef} key={anime.id} xs={4} sm={4} md={3} lg={2} as={motion.div} variants={itemVariants}>
                                    <AnimeCard anime={anime} onClick={onCardClick} />
                                </Col>
                            );
                        } else {
                            return (
                                <Col key={anime.id} xs={4} sm={4} md={3} lg={2} as={motion.div} variants={itemVariants}>
                                    <AnimeCard anime={anime} onClick={onCardClick} />
                                </Col>
                            );
                        }
                    })}
                </Row>
            </motion.div>
            
            {loading && (
                <div className="mt-4">
                     <SkeletonGrid />
                </div>
            )}
            
            {!loading && !hasNext && items.length > 0 && (
                <p className="text-center text-muted mt-5 mb-5">You have reached the end.</p>
            )}
        </>
    );
};

export default InfiniteScrollGrid;
