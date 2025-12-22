import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { getProxiedImage } from '../utils/imageHelper';

const AnimeCard = ({ anime }) => {
  const title = anime.title.english || anime.title.romaji;
  
  return (
    <Link to={`/anime/${anime.id}`} className="anime-card-link">
      <Motion.div 
        className="anime-card"
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Poster Image */}
        <img 
          src={getProxiedImage(anime.coverImage.large)} 
          alt={title} 
          className="anime-cover"
          loading="lazy"
        />

        {/* Top Badges (Score & Format) */}
        <div className="card-badges">
          {anime.status_label && (
             <span className={`badge-item status ${anime.status_label.toLowerCase().replace(/\s+/g, '-')}`}>
               {anime.status_label}
             </span>
          )}
          {anime.averageScore && (
            <span className="badge-item score">
              ★ {anime.averageScore / 10}
            </span>
          )}
          {anime.format && <span className="badge-item format">{anime.format}</span>}
        </div>

        {/* Bottom Gradient and Title */}
        <div className="card-overlay">
          <div className="card-gradient"></div>
          <div className="card-info">
            <h3 className="card-title" title={title}>
              {title}
            </h3>
          </div>
        </div>
      </Motion.div>
    </Link>
  );
};

export default AnimeCard;
