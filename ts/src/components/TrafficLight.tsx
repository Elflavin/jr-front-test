import React from 'react';

type TrafficLightStatus = 'green' | 'orange' | 'red' | 'off';

interface TrafficLightProps {
  status: TrafficLightStatus;
}

// label 'traffic-light' added
const TrafficLight: React.FC<TrafficLightProps> = ({ status }) => {
  return (
    <div className="traffic-light-container" aria-label='traffic-light'>
      <div className="traffic-light">
        <div className={`light red ${status === 'red' ? 'active' : ''}`}></div>
        <div className={`light orange ${status === 'orange' ? 'active' : ''}`}></div>
        <div className={`light green ${status === 'green' ? 'active' : ''}`}></div>
      </div>
    </div>
  );
};

export default TrafficLight;
