import React from 'react';
import { Badge } from 'react-bootstrap';

const AnimeCard = ({ anime }) => {
  const title = anime.title.english || anime.title.romaji;
  
  return (
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
  );
};

export default AnimeCard;
