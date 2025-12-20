import React from 'react';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AnimeCard = ({ anime }) => {
  const title = anime.title.english || anime.title.romaji;
  
  return (
    <Link to={`/anime/${anime.id}`}>
      <div className="anime-card">
        <img 
          src={anime.coverImage.large} 
          alt={title} 
          className="anime-cover"
          loading="lazy"
        />
        <div className="anime-title" title={title}>
          {title}
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
