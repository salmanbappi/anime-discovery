import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 1000
          }}
        >
          <Button
            variant="primary"
            className="rounded-circle shadow-lg d-flex align-items-center justify-content-center"
            onClick={scrollToTop}
            style={{
              width: '50px',
              height: '50px',
              border: 'none',
              backgroundColor: 'var(--primary-color)'
            }}
          >
            <i className="bi bi-arrow-up fs-4"></i>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
