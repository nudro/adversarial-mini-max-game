import React from 'react';
import styled from 'styled-components';

const ControlsContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
`;

const ControlsTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
  color: #fff;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const ControlGroup = styled.div`
  margin-bottom: 1rem;
`;

const ControlLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #f0f0f0;
`;

const Slider = styled.input`
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  border-radius: 4px;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${props => props.color || 'var(--gradient-end)'};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${props => props.color || 'var(--gradient-end)'};
    cursor: pointer;
    border: none;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  cursor: pointer;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ControlButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  background-color: ${props => props.isRunning ? 'var(--adversary-color)' : 'var(--defender-color)'};
  color: white;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const ResetButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const ValueDisplay = styled.span`
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: #ddd;
`;

const GameControls = ({
  isRunning,
  setIsRunning,
  animationSpeed,
  setAnimationSpeed,
  showLoss,
  setShowLoss,
  showGradients,
  setShowGradients,
  attackStrength,
  setAttackStrength,
  defenseStrength,
  setDefenseStrength
}) => {
  const handleReset = () => {
    setIsRunning(false);
    setAnimationSpeed(5);
    setAttackStrength(5);
    setDefenseStrength(5);
    setShowLoss(true);
    setShowGradients(true);
  };
  
  return (
    <ControlsContainer>
      <ControlsTitle>Simulation Controls</ControlsTitle>
      
      <ControlsGrid>
        <div>
          <ControlGroup>
            <ControlLabel htmlFor="animationSpeed">
              Animation Speed
              <ValueDisplay>{animationSpeed}</ValueDisplay>
            </ControlLabel>
            <Slider
              id="animationSpeed"
              type="range"
              min="1"
              max="10"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
            />
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel htmlFor="attackStrength">
              Adversary Strength
              <ValueDisplay>{attackStrength}</ValueDisplay>
            </ControlLabel>
            <Slider
              id="attackStrength"
              type="range"
              min="1"
              max="10"
              value={attackStrength}
              onChange={(e) => setAttackStrength(parseInt(e.target.value))}
              color="var(--adversary-color)"
            />
          </ControlGroup>
        </div>
        
        <div>
          <ControlGroup>
            <ControlLabel htmlFor="defenseStrength">
              Defender Strength
              <ValueDisplay>{defenseStrength}</ValueDisplay>
            </ControlLabel>
            <Slider
              id="defenseStrength"
              type="range"
              min="1"
              max="10"
              value={defenseStrength}
              onChange={(e) => setDefenseStrength(parseInt(e.target.value))}
              color="var(--defender-color)"
            />
          </ControlGroup>
          
          <ControlGroup>
            <CheckboxContainer>
              <Checkbox
                id="showLoss"
                type="checkbox"
                checked={showLoss}
                onChange={() => setShowLoss(!showLoss)}
              />
              <ControlLabel htmlFor="showLoss" style={{ margin: 0 }}>
                Show Loss Landscape
              </ControlLabel>
            </CheckboxContainer>
            
            <CheckboxContainer>
              <Checkbox
                id="showGradients"
                type="checkbox"
                checked={showGradients}
                onChange={() => setShowGradients(!showGradients)}
              />
              <ControlLabel htmlFor="showGradients" style={{ margin: 0 }}>
                Show Gradient Flows
              </ControlLabel>
            </CheckboxContainer>
          </ControlGroup>
        </div>
      </ControlsGrid>
      
      <ButtonsContainer>
        <ControlButton
          isRunning={isRunning}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Pause Simulation' : 'Start Simulation'}
        </ControlButton>
        <ResetButton onClick={handleReset}>
          Reset Simulation
        </ResetButton>
      </ButtonsContainer>
    </ControlsContainer>
  );
};

export default GameControls; 