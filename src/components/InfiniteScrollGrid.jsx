import React, { useRef, useCallback, useMemo } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import AnimeCard from './AnimeCard';
import SkeletonCard from './SkeletonCard';

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
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

    // Ensure we don't have duplicate keys - Memoized
    const uniqueItems = useMemo(() => {
        return Array.from(new Map(items.map(item => [item.id, item])).values());
    }, [items]);

    return (
        <>
            <Row className="g-3">
                {uniqueItems.map((anime, index) => {
                    const isLast = uniqueItems.length === index + 1;
                    return (
                        <Col 
                            ref={isLast ? lastElementRef : null} 
                            key={anime.id} 
                            xs={4} sm={4} md={3} lg={2}
                        >
                            <motion.div
                                variants={itemVariants}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.1 }}
                            >
                                <AnimeCard anime={anime} onClick={onCardClick} />
                            </motion.div>
                        </Col>
                    );
                })}
            </Row>
            
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
