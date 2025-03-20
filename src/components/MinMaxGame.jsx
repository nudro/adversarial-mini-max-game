import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import { 
  generateLossLandscape, 
  generateContours, 
  generateGradientField, 
  simulateStep,
  getLossColor,
  calculateDynamicLoss
} from '../utils/gameUtils';

const GameContainer = styled.div`
  position: relative;
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  height: 600px;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
`;

const Legend = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.9rem;
  z-index: 10;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 10px;
  background-color: ${props => props.color};
  border-radius: 2px;
`;

const LegendGradient = styled.div`
  width: 80px;
  height: 10px;
  border-radius: 2px;
  background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
`;

const LegendLabel = styled.span`
  font-size: 0.8rem;
  color: white;
`;

const StatsDisplay = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.9rem;
  z-index: 10;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  color: #aaa;
`;

const StatValue = styled.span`
  font-size: 0.9rem;
  color: white;
  font-weight: 600;
`;

const AdversaryAdvantage = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(245, 81, 66, 0.7);
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
  z-index: 10;
  display: ${props => props.show ? 'block' : 'none'};
  animation: pulse 2s infinite;
`;

// New styled components for the loss graph
const LossGraphContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 4px;
  width: 250px;
  height: 150px;
  z-index: 10;
`;

const LossGraphTitle = styled.div`
  font-size: 0.8rem;
  color: white;
  margin-bottom: 5px;
  text-align: center;
`;

const LossGraphCanvas = styled.canvas`
  width: 100%;
  height: 120px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
`;

const MinMaxGame = ({
  isRunning,
  animationSpeed,
  showLoss,
  showGradients,
  attackStrength,
  defenseStrength
}) => {
  const canvasRef = useRef(null);
  const lossGraphRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [grid, setGrid] = useState(null);
  const [contours, setContours] = useState([]);
  const [gradientField, setGradientField] = useState([]);
  const [defender, setDefender] = useState(null);
  const [adversary, setAdversary] = useState(null);
  const [iteration, setIteration] = useState(0);
  const [defenderLoss, setDefenderLoss] = useState(0);
  const [adversaryLoss, setAdversaryLoss] = useState(0);
  const [defenderHistory, setDefenderHistory] = useState([]);
  const [adversaryHistory, setAdversaryHistory] = useState([]);
  const [lossHistory, setLossHistory] = useState({ defender: [], adversary: [] });
  
  // Initialize dimensions and landscape
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  // Generate loss landscape when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    // Create grid at appropriate resolution for the canvas
    const resolution = 5; // Higher = more coarse but faster
    const newGrid = generateLossLandscape(dimensions.width, dimensions.height, resolution);
    setGrid(newGrid);
    
    // Generate contours and gradient field
    const newContours = generateContours(newGrid, 15);
    setContours(newContours);
    
    const newGradientField = generateGradientField(newGrid, 20);
    setGradientField(newGradientField);
    
    // Initial positions for defender and adversary
    const rows = newGrid.length;
    const cols = newGrid[0].length;
    
    setDefender({ x: cols * 0.3, y: rows * 0.7 });
    setAdversary({ x: cols * 0.7, y: rows * 0.3 });
    
    // Reset histories and iteration counter
    setDefenderHistory([]);
    setAdversaryHistory([]);
    setLossHistory({ defender: [], adversary: [] });
    setIteration(0);
  }, [dimensions]);
  
  // Update loss values for both players using the new dynamic loss calculation
  useEffect(() => {
    if (!grid || !defender || !adversary) return;
    
    const { defenderLoss, adversaryLoss } = calculateDynamicLoss(
      grid, 
      defender, 
      adversary, 
      iteration,
      defenseStrength,
      attackStrength
    );
    
    setDefenderLoss(defenderLoss);
    setAdversaryLoss(adversaryLoss);
    
    // Update loss history
    setLossHistory(prev => ({
      defender: [...prev.defender, defenderLoss].slice(-100), // Keep last 100 points
      adversary: [...prev.adversary, adversaryLoss].slice(-100)
    }));
    
  }, [grid, defender, adversary, iteration, defenseStrength, attackStrength]);
  
  // Animation effect - update positions
  useEffect(() => {
    if (!isRunning || !grid || !defender || !adversary) return;
    
    let animationFrameId;
    let lastUpdateTime = Date.now();
    const updateInterval = 1000 / animationSpeed;
    
    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime;
      
      if (deltaTime >= updateInterval) {
        // Compute next positions
        const { defender: newDefender, adversary: newAdversary } = 
          simulateStep(defender, adversary, grid, defenseStrength, attackStrength);
        
        // Update positions
        setDefender(newDefender);
        setAdversary(newAdversary);
        
        // Update position histories (limited to last 50 positions)
        setDefenderHistory(prev => {
          const updated = [...prev, newDefender];
          return updated.length > 50 ? updated.slice(-50) : updated;
        });
        
        setAdversaryHistory(prev => {
          const updated = [...prev, newAdversary];
          return updated.length > 50 ? updated.slice(-50) : updated;
        });
        
        // Increment iteration counter
        setIteration(prev => prev + 1);
        
        lastUpdateTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isRunning, grid, defender, adversary, attackStrength, defenseStrength, animationSpeed]);
  
  // Draw loss graph
  useEffect(() => {
    if (!lossGraphRef.current || lossHistory.defender.length < 2) return;
    
    const canvas = lossGraphRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return; // Safety check
    
    try {
      // Set canvas dimensions (ensure high resolution)
      canvas.width = canvas.clientWidth * 2;
      canvas.height = canvas.clientHeight * 2;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background grid
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      
      // Horizontal grid lines
      for (let i = 0; i < 5; i++) {
        const y = i * (canvas.height / 4);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Vertical grid lines
      for (let i = 0; i < 6; i++) {
        const x = i * (canvas.width / 5);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw axes labels
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'left';
      ctx.fillText('1.0', 5, 15);
      ctx.fillText('0.0', 5, canvas.height - 5);
      
      // Draw loss lines
      const drawLossLine = (data, color) => {
        if (data.length < 2) return;
        
        const xStep = canvas.width / (data.length - 1);
        const yScale = canvas.height;
        
        ctx.beginPath();
        ctx.moveTo(0, (1 - data[0]) * yScale);
        
        for (let i = 1; i < data.length; i++) {
          ctx.lineTo(i * xStep, (1 - data[i]) * yScale);
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      
      // Draw defender loss line
      drawLossLine(lossHistory.defender, 'var(--defender-color)');
      
      // Draw adversary loss line
      drawLossLine(lossHistory.adversary, 'var(--adversary-color)');
    } catch (error) {
      console.error("Error rendering loss graph:", error);
    }
  }, [lossHistory]);
  
  // Render main visualization
  useEffect(() => {
    if (!canvasRef.current || !dimensions.width || !grid || !defender || !adversary) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return; // Safety check
    
    try {
      // Set canvas dimensions
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Check if adversary has advantage
      const adversaryHasAdvantage = attackStrength > defenseStrength;
      
      // Add a subtle red vignette effect when adversary has advantage
      if (adversaryHasAdvantage) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.7
        );
        gradient.addColorStop(0, 'rgba(245, 81, 66, 0)');
        gradient.addColorStop(1, `rgba(245, 81, 66, ${0.15 + 0.1 * Math.sin(iteration / 10)})`); // Pulsating effect
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw loss landscape
      if (showLoss) {
        const resolution = 5;
        const rows = grid.length;
        const cols = grid[0].length;
        
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            const value = grid[i][j];
            ctx.fillStyle = getLossColor(value);
            ctx.fillRect(j * resolution, i * resolution, resolution, resolution);
          }
        }
        
        // Draw contour lines
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        
        for (const contour of contours) {
          const { points } = contour;
          
          for (let i = 0; i < points.length; i += 2) {
            if (i + 1 < points.length) {
              ctx.beginPath();
              ctx.moveTo(points[i].x * resolution, points[i].y * resolution);
              ctx.lineTo(points[i + 1].x * resolution, points[i + 1].y * resolution);
              ctx.stroke();
            }
          }
        }
      } else {
        // If not showing loss landscape, just draw a dark background
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw gradient vectors
      if (showGradients) {
        const resolution = 5;
        ctx.lineWidth = 1;
        
        for (const grad of gradientField) {
          const { x, y, dx, dy, magnitude } = grad;
          
          // Scale arrow length by gradient magnitude (with limits)
          const length = Math.min(Math.max(magnitude * 30, 5), 15);
          
          // Normalize direction
          const dirX = dx / magnitude;
          const dirY = dy / magnitude;
          
          // Draw the arrow
          ctx.beginPath();
          ctx.moveTo(x * resolution, y * resolution);
          ctx.lineTo((x + dirX * length) * resolution, (y + dirY * length) * resolution);
          
          // Gradient from dark blue to lighter blue
          const alpha = 0.2 + magnitude * 0.6;
          ctx.strokeStyle = `rgba(150, 150, 255, ${alpha})`;
          ctx.stroke();
          
          // Draw arrowhead
          const headLength = 3;
          const angle = Math.atan2(dirY, dirX);
          
          ctx.beginPath();
          ctx.moveTo((x + dirX * length) * resolution, (y + dirY * length) * resolution);
          ctx.lineTo(
            (x + dirX * length - headLength * Math.cos(angle - Math.PI / 6)) * resolution,
            (y + dirY * length - headLength * Math.sin(angle - Math.PI / 6)) * resolution
          );
          ctx.lineTo(
            (x + dirX * length - headLength * Math.cos(angle + Math.PI / 6)) * resolution,
            (y + dirY * length - headLength * Math.sin(angle + Math.PI / 6)) * resolution
          );
          ctx.closePath();
          ctx.fillStyle = `rgba(150, 150, 255, ${alpha})`;
          ctx.fill();
        }
      }
      
      // The resolution for player paths and entities
      const resolution = 5;
      
      // Defender path
      if (defenderHistory.length > 1) {
        ctx.beginPath();
        ctx.moveTo(defenderHistory[0].x * resolution, defenderHistory[0].y * resolution);
        
        for (let i = 1; i < defenderHistory.length; i++) {
          ctx.lineTo(defenderHistory[i].x * resolution, defenderHistory[i].y * resolution);
        }
        
        ctx.strokeStyle = 'rgba(66, 135, 245, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Adversary path
      if (adversaryHistory.length > 1) {
        ctx.beginPath();
        ctx.moveTo(adversaryHistory[0].x * resolution, adversaryHistory[0].y * resolution);
        
        for (let i = 1; i < adversaryHistory.length; i++) {
          ctx.lineTo(adversaryHistory[i].x * resolution, adversaryHistory[i].y * resolution);
        }
        
        ctx.strokeStyle = 'rgba(245, 81, 66, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw interaction line between adversary and defender
      ctx.beginPath();
      ctx.moveTo(defender.x * resolution, defender.y * resolution);
      ctx.lineTo(adversary.x * resolution, adversary.y * resolution);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw players with strength indicators
      const defenderSize = adversaryHasAdvantage ? 0.9 : 1.1; // Smaller when at disadvantage
      const adversarySize = adversaryHasAdvantage ? 1.2 : 1.0; // Larger when at advantage
      
      // Draw defender with pulsating effect based on loss
      const defenderPulse = 1.0 + Math.sin(iteration / 5) * 0.1;
      const defenderRadius = 8 * defenderSize * (1 + defenderLoss * 0.5) * defenderPulse;
      
      ctx.beginPath();
      ctx.arc(defender.x * resolution, defender.y * resolution, defenderRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--defender-color)';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw defender strength rings when stronger
      if (defenseStrength > attackStrength) {
        const strengthDiff = defenseStrength - attackStrength;
        for (let i = 1; i <= Math.min(strengthDiff, 3); i++) {
          ctx.beginPath();
          ctx.arc(
            defender.x * resolution, 
            defender.y * resolution, 
            defenderRadius + i * 4, 
            0, Math.PI * 2
          );
          ctx.strokeStyle = `rgba(66, 135, 245, ${0.7 - i * 0.2})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      
      // Draw adversary with pulsating effect based on loss
      const adversaryPulse = 1.0 + Math.sin(iteration / 5 + Math.PI) * 0.1;
      const adversaryRadius = 8 * adversarySize * (1 + adversaryLoss * 0.5) * adversaryPulse;
      
      ctx.beginPath();
      ctx.arc(adversary.x * resolution, adversary.y * resolution, adversaryRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--adversary-color)';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw adversary strength rings when stronger
      if (attackStrength > defenseStrength) {
        const strengthDiff = attackStrength - defenseStrength;
        for (let i = 1; i <= Math.min(strengthDiff, 3); i++) {
          ctx.beginPath();
          ctx.arc(
            adversary.x * resolution, 
            adversary.y * resolution, 
            adversaryRadius + i * 4, 
            0, Math.PI * 2
          );
          ctx.strokeStyle = `rgba(245, 81, 66, ${0.7 - i * 0.2})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      
      // Label players
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Defender', defender.x * resolution, defender.y * resolution - 15);
      ctx.fillText('Adversary', adversary.x * resolution, adversary.y * resolution - 15);
      
      // If adversary has significant advantage and enough iterations have passed,
      // draw "domination zones" - areas where adversary is effectively controlling the game
      if (adversaryHasAdvantage && iteration > 100 && attackStrength - defenseStrength >= 2) {
        try {
          // Draw domination zones as semi-transparent adversary-colored circles
          const numZones = Math.min(Math.floor((iteration - 100) / 50), 3); // Max 3 zones
          
          for (let i = 0; i < numZones; i++) {
            if (!canvas || !ctx) continue;
            
            const zoneX = Math.min(Math.max(
              adversary.x * resolution + Math.cos(iteration / 20 + i * Math.PI * 2/3) * 80,
              0
            ), canvas.width);
            
            const zoneY = Math.min(Math.max(
              adversary.y * resolution + Math.sin(iteration / 20 + i * Math.PI * 2/3) * 80,
              0
            ), canvas.height);
            
            const zoneSize = 30 + Math.sin(iteration / 15 + i) * 5; // Pulsating size
            
            // Draw pulsating zone
            ctx.beginPath();
            ctx.arc(zoneX, zoneY, zoneSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 81, 66, ${0.15 + 0.05 * Math.sin(iteration / 10)})`; 
            ctx.fill();
            
            // Draw zone border
            ctx.beginPath();
            ctx.arc(zoneX, zoneY, zoneSize, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(245, 81, 66, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        } catch (error) {
          console.error("Error rendering domination zones:", error);
        }
      }
    } catch (error) {
      console.error("Error in main rendering:", error);
    }
  }, [dimensions, grid, contours, gradientField, defender, adversary, defenderHistory, adversaryHistory, showLoss, showGradients, iteration, defenderLoss, adversaryLoss, attackStrength, defenseStrength]);
  
  return (
    <GameContainer ref={containerRef}>
      <Canvas ref={canvasRef} />
      
      <AdversaryAdvantage show={attackStrength > defenseStrength}>
        Adversary Has Advantage
      </AdversaryAdvantage>
      
      <StatsDisplay>
        <StatItem>
          <StatLabel>Iterations:</StatLabel>
          <StatValue>{iteration}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Defender Loss:</StatLabel>
          <StatValue 
            style={{ 
              color: defenderLoss > adversaryLoss ? 'var(--adversary-color)' : 'white'
            }}
          >
            {defenderLoss.toFixed(3)}
          </StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Adversary Loss:</StatLabel>
          <StatValue 
            style={{ 
              color: adversaryLoss < defenderLoss ? 'var(--adversary-color)' : 'white'
            }}
          >
            {adversaryLoss.toFixed(3)}
          </StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Attack/Defense Ratio:</StatLabel>
          <StatValue
            style={{
              color: attackStrength > defenseStrength ? 'var(--adversary-color)' : 'white'
            }}
          >
            {defenderLoss > 0 ? (adversaryLoss / defenderLoss).toFixed(2) : 'N/A'}
          </StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Strength Balance:</StatLabel>
          <StatValue
            style={{
              color: attackStrength > defenseStrength ? 'var(--adversary-color)' : 
                    attackStrength < defenseStrength ? 'var(--defender-color)' : 'white'
            }}
          >
            {attackStrength === defenseStrength ? 'Equal' : 
             attackStrength > defenseStrength ? 'Adversary +' + (attackStrength - defenseStrength) : 
             'Defender +' + (defenseStrength - attackStrength)}
          </StatValue>
        </StatItem>
      </StatsDisplay>
      
      <LossGraphContainer>
        <LossGraphTitle>Loss Values Over Time</LossGraphTitle>
        <LossGraphCanvas ref={lossGraphRef} />
      </LossGraphContainer>
      
      <Legend>
        <LegendItem>
          <LegendColor color="var(--defender-color)" />
          <LegendLabel>Defender</LegendLabel>
        </LegendItem>
        <LegendItem>
          <LegendColor color="var(--adversary-color)" />
          <LegendLabel>Adversary</LegendLabel>
        </LegendItem>
        <LegendItem>
          <LegendGradient />
          <LegendLabel>Loss Value</LegendLabel>
        </LegendItem>
      </Legend>
    </GameContainer>
  );
};

export default MinMaxGame; 