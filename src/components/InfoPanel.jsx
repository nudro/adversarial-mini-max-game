import React from 'react';
import styled from 'styled-components';

const InfoContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  height: fit-content;
  overflow-y: auto;
  max-height: 600px;
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
  color: #fff;
`;

const InfoSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h4`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #f0f0f0;
`;

const InfoText = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  color: #ddd;
  margin-bottom: 0.75rem;
`;

const ColorKey = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ColorSwatch = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
  background-color: ${props => props.color};
`;

const ColorLabel = styled.span`
  font-size: 0.9rem;
  color: #ddd;
`;

const MathFormula = styled.div`
  font-family: 'Courier New', monospace;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #f0f0f0;
  overflow-x: auto;
  white-space: nowrap;
`;

const HighlightText = styled.span`
  color: ${props => props.color || '#ffcc00'};
  font-weight: ${props => props.bold ? '600' : 'normal'};
`;

const InfoPanel = () => {
  return (
    <InfoContainer>
      <InfoTitle>Understanding the Visualization</InfoTitle>
      
      <InfoSection>
        <SectionTitle>The Min-Max Game</SectionTitle>
        <InfoText>
          Adversarial training is formulated as a min-max game between two players:
          the defender (model) trying to minimize loss and the adversary trying to maximize it.
        </InfoText>
        <InfoText>
          In this simulation, we use <HighlightText>Monte Carlo sampling</HighlightText> and 
          <HighlightText> Gibbs smoothing</HighlightText> to create a realistic loss landscape 
          with saddle points and local optima.
        </InfoText>
      </InfoSection>
      
      <InfoSection>
        <SectionTitle>Adversary vs. Defender Strength</SectionTitle>
        <InfoText>
          When the <HighlightText color="var(--adversary-color)">adversary's strength</HighlightText> exceeds 
          the <HighlightText color="var(--defender-color)">defender's strength</HighlightText>, the dynamics 
          of the game change significantly:
        </InfoText>
        <InfoText>
          • The adversary becomes more efficient at finding loss-maximizing perturbations
        </InfoText>
        <InfoText>
          • The defender struggles to minimize loss, as the adversary consistently finds new vulnerabilities
        </InfoText>
        <InfoText>
          • The adversary's loss decreases while the defender's loss increases
        </InfoText>
        <InfoText>
          • This represents scenarios where adversarial attacks are successful despite the model's best efforts
        </InfoText>
      </InfoSection>
      
      <InfoSection>
        <SectionTitle>Color Key</SectionTitle>
        <ColorKey>
          <ColorSwatch color="var(--defender-color)" />
          <ColorLabel>Defender (minimizing loss)</ColorLabel>
        </ColorKey>
        <ColorKey>
          <ColorSwatch color="var(--adversary-color)" />
          <ColorLabel>Adversary (maximizing loss)</ColorLabel>
        </ColorKey>
        <ColorKey>
          <ColorSwatch color="var(--gradient-start)" />
          <ColorLabel>Low Loss Value</ColorLabel>
        </ColorKey>
        <ColorKey>
          <ColorSwatch color="var(--gradient-end)" />
          <ColorLabel>High Loss Value</ColorLabel>
        </ColorKey>
      </InfoSection>
      
      <InfoSection>
        <SectionTitle>Elements in the Visualization</SectionTitle>
        <InfoText>
          <strong>Landscape:</strong> Represents the loss terrain the players navigate.
        </InfoText>
        <InfoText>
          <strong>Gradient flows:</strong> Show how each player updates their strategy.
        </InfoText>
        <InfoText>
          <strong>Loss contours:</strong> Elevation lines showing regions of equal loss.
        </InfoText>
        <InfoText>
          <strong>Loss graph:</strong> Real-time plot showing loss values for both players over time.
        </InfoText>
      </InfoSection>
      
      <InfoSection>
        <SectionTitle>Mathematical Formulation</SectionTitle>
        <MathFormula>
          min<sub>θ</sub> max<sub>δ</sub> L(x + δ, y; θ)
        </MathFormula>
        <InfoText>
          where θ represents model parameters, δ represents the adversarial perturbation,
          x is the input data, y is the label, and L is the loss function.
        </InfoText>
      </InfoSection>

      <InfoSection>
        <SectionTitle>Simulation Techniques</SectionTitle>
        <InfoText>
          <strong>Monte Carlo Sampling:</strong> Introduces randomness to simulate the stochastic 
          nature of mini-batch gradient descent, creating a more realistic optimization landscape.
        </InfoText>
        <InfoText>
          <strong>Gibbs Smoothing:</strong> Creates local correlations in the loss landscape, 
          simulating how neighboring parameter configurations have similar loss values in real models.
        </InfoText>
        <InfoText>
          <strong>Adaptive Step Sizes:</strong> Both players adjust their step sizes based on 
          gradient magnitudes, simulating adaptive optimizers like Adam or RMSProp used in practice.
        </InfoText>
        <InfoText>
          <strong>Momentum:</strong> Players maintain velocity in their updates, helping them 
          navigate saddle points and local optima more effectively.
        </InfoText>
      </InfoSection>

      <InfoSection>
        <SectionTitle>Dynamic Loss Calculation</SectionTitle>
        <InfoText>
          The loss values are calculated dynamically based on:
        </InfoText>
        <InfoText>
          • Relative positions of both players
        </InfoText>
        <InfoText>
          • Current landscape value at each position
        </InfoText>
        <InfoText>
          • Distance between players (adversarial gap)
        </InfoText>
        <InfoText>
          • Training progress (iteration count)
        </InfoText>
      </InfoSection>

      <InfoSection>
        <SectionTitle>Realistic Adversarial Dynamics</SectionTitle>
        <InfoText>
          This simulation demonstrates realistic aspects of adversarial training:
        </InfoText>
        <InfoText>
          • <strong>Strength imbalance:</strong> When adversary strength exceeds defender strength, 
          the adversary finds more effective perturbations that increase the model's loss.
        </InfoText>
        <InfoText>
          • <strong>Growing gap:</strong> Over time, a stronger adversary can exploit the model's 
          weaknesses more effectively, leading to a widening gap between losses.
        </InfoText>
        <InfoText>
          • <strong>Optimization race:</strong> The red pulsating indicator appears when the adversary 
          has an advantage, signaling potential vulnerability in the defender.
        </InfoText>
        <InfoText>
          • <strong>Highlighted stats:</strong> Loss values are highlighted in red when they indicate 
          the adversary is succeeding at its objective.
        </InfoText>
      </InfoSection>
    </InfoContainer>
  );
};

export default InfoPanel; 