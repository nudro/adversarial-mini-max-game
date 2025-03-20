import React, { useState } from 'react';
import styled from 'styled-components';
import MinMaxGame from './components/MinMaxGame';
import GameControls from './components/GameControls';
import InfoPanel from './components/InfoPanel';

const AppContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, var(--defender-color), var(--adversary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: inline-block;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

function App() {
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [showLoss, setShowLoss] = useState(true);
  const [showGradients, setShowGradients] = useState(true);
  const [attackStrength, setAttackStrength] = useState(5);
  const [defenseStrength, setDefenseStrength] = useState(5);
  
  return (
    <AppContainer>
      <Header>
        <Title>Adversarial Min-Max Game</Title>
        <Subtitle>
          Visualizing the robust training process: the defender minimizes the adversarial loss 
          while the adversary tries to maximize it
        </Subtitle>
      </Header>
      
      <MainContent>
        <MinMaxGame 
          isRunning={isRunning}
          animationSpeed={animationSpeed}
          showLoss={showLoss}
          showGradients={showGradients}
          attackStrength={attackStrength}
          defenseStrength={defenseStrength}
        />
        
        <InfoPanel />
      </MainContent>
      
      <GameControls 
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        showLoss={showLoss}
        setShowLoss={setShowLoss}
        showGradients={showGradients}
        setShowGradients={setShowGradients}
        attackStrength={attackStrength}
        setAttackStrength={setAttackStrength}
        defenseStrength={defenseStrength}
        setDefenseStrength={setDefenseStrength}
      />
    </AppContainer>
  );
}

export default App; 