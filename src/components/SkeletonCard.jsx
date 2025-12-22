import React from 'react';
import { Placeholder } from 'react-bootstrap';

const SkeletonCard = () => {
  return (
    <div className="anime-card" style={{ aspectRatio: '2/3', overflow: 'hidden', backgroundColor: '#222' }}>
      <Placeholder as="div" animation="glow" style={{ width: '100%', height: '100%' }}>
        <Placeholder xs={12} style={{ height: '100%', backgroundColor: '#333' }} />
      </Placeholder>
    </div>
  );
};

export default SkeletonCard;
