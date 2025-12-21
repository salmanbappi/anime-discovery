import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AnimeCard = ({ anime }) => {
  const title = anime.title.english || anime.title.romaji;
  
  return (
    <Link to={`/anime/${anime.id}`}>
      <motion.div 
        className="anime-card-container"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="anime-card">
          <img 
            src={anime.coverImage.large} 
            alt={title} 
            className="anime-cover"
            loading="lazy"
          />
        </div>
        <div className="anime-title" title={title}>
          {title}
        </div>
      </motion.div>
    </Link>
  );
};

export default AnimeCard;