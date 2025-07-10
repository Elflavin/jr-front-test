import React from 'react';

interface InputSectionProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onCheckStatus: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  inputValue, 
  onInputChange, 
  onCheckStatus 
}) => {
  return (// onKeyDown 'Enter' added
    <div className="input-section">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if(e.key === 'Enter'){
            onCheckStatus();
          }
        }}
        placeholder="Enter HTTP status code or name"
      />
      <button onClick={onCheckStatus}>Check Status</button>
    </div>
  );
};

export default InputSection;
