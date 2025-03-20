/**
 * Generates a loss landscape based on a superposition of Gaussian functions
 * with additional Monte Carlo perturbations for realism
 * 
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} resolution - Grid resolution (lower = higher quality but slower)
 * @returns {Array} - 2D array of loss values
 */
export const generateLossLandscape = (width, height, resolution = 5) => {
  const cols = Math.floor(width / resolution);
  const rows = Math.floor(height / resolution);
  
  // Initialize the grid
  const grid = new Array(rows);
  for (let i = 0; i < rows; i++) {
    grid[i] = new Array(cols);
  }
  
  // Create multiple Gaussian peaks for a complex landscape
  const peaks = [
    { x: cols * 0.3, y: rows * 0.7, height: 0.8, spread: 0.2 },
    { x: cols * 0.7, y: rows * 0.3, height: 1.0, spread: 0.2 },
    { x: cols * 0.5, y: rows * 0.5, height: 0.7, spread: 0.3 },
    { x: cols * 0.2, y: rows * 0.2, height: 0.5, spread: 0.1 },
    { x: cols * 0.8, y: rows * 0.8, height: 0.6, spread: 0.15 }
  ];
  
  // Add saddle points (critical for adversarial dynamics)
  const saddlePoints = [
    { x: cols * 0.4, y: rows * 0.4, strength: 0.3, spreadX: 0.2, spreadY: 0.3 },
    { x: cols * 0.6, y: rows * 0.6, strength: 0.4, spreadX: 0.25, spreadY: 0.15 }
  ];
  
  // Fill the grid with combined function values
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let gaussianValue = 0;
      
      // Add Gaussian peaks
      for (const peak of peaks) {
        // Squared distance from current point to peak
        const dx = j - peak.x;
        const dy = i - peak.y;
        const distSquared = (dx*dx + dy*dy) / (cols*cols + rows*rows);
        
        // Gaussian function
        gaussianValue += peak.height * Math.exp(-distSquared / (2 * peak.spread * peak.spread));
      }
      
      // Add saddle points (creates areas of unstable equilibrium)
      let saddleValue = 0;
      for (const saddle of saddlePoints) {
        const dx = (j - saddle.x) / cols;
        const dy = (i - saddle.y) / rows;
        
        // Saddle function: x²/a² - y²/b²
        saddleValue += saddle.strength * (
          Math.pow(dx / saddle.spreadX, 2) - 
          Math.pow(dy / saddle.spreadY, 2)
        );
      }
      
      // Monte Carlo noise (adds realistic stochasticity to the landscape)
      // This simulates the randomness in gradient estimation during adversarial training
      const mcNoise = boxMullerTransform() * 0.08;
      
      // Combine values and add small uniform noise for variation
      let value = gaussianValue + saddleValue * 0.2 + mcNoise + Math.random() * 0.02;
      
      // Ensure value is within bounds [0, 1]
      grid[i][j] = Math.min(Math.max(value, 0), 1);
    }
  }
  
  // Apply Gibbs sampling smoothing pass (simulates local correlations in loss landscape)
  return gibbsSmoothingPass(grid, 1);
};

/**
 * Box-Muller transform for generating normally distributed random numbers
 * Used to create more realistic noise patterns in the loss landscape
 * 
 * @returns {number} - Standard normally distributed random number
 */
const boxMullerTransform = () => {
  const u1 = Math.random();
  const u2 = Math.random();
  
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0;
};

/**
 * Applies Gibbs sampling to smooth the grid
 * This creates more realistic loss landscapes with proper local correlations
 * 
 * @param {Array} grid - Input grid to smooth
 * @param {number} iterations - Number of smoothing passes
 * @returns {Array} - Smoothed grid
 */
const gibbsSmoothingPass = (grid, iterations = 1) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const smoothedGrid = JSON.parse(JSON.stringify(grid)); // Deep copy
  
  for (let iter = 0; iter < iterations; iter++) {
    // For Gibbs sampling, we update each cell based on its neighbors
    for (let i = 1; i < rows - 1; i++) {
      for (let j = 1; j < cols - 1; j++) {
        // Calculate weighted average of neighbors
        const neighborAvg = (
          smoothedGrid[i-1][j] + 
          smoothedGrid[i+1][j] + 
          smoothedGrid[i][j-1] + 
          smoothedGrid[i][j+1]
        ) / 4.0;
        
        // Update with Gibbs sampling formula (mixture of original and neighbor values)
        const temperature = 0.2; // Controls smoothness (lower = smoother)
        const weight = Math.exp(-Math.abs(smoothedGrid[i][j] - neighborAvg) / temperature);
        
        smoothedGrid[i][j] = weight * neighborAvg + (1 - weight) * smoothedGrid[i][j];
      }
    }
  }
  
  return smoothedGrid;
};

/**
 * Creates contour lines from a grid of values
 * 
 * @param {Array} grid - 2D array of values
 * @param {number} levels - Number of contour levels
 * @returns {Array} - Array of contour lines at different levels
 */
export const generateContours = (grid, levels = 10) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const contours = [];
  
  for (let k = 1; k <= levels; k++) {
    const threshold = k / levels;
    const lines = [];
    
    // Check each cell for contour line segments
    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < cols - 1; j++) {
        const cell = [
          { x: j, y: i, value: grid[i][j] },
          { x: j + 1, y: i, value: grid[i][j + 1] },
          { x: j + 1, y: i + 1, value: grid[i + 1][j + 1] },
          { x: j, y: i + 1, value: grid[i + 1][j] }
        ];
        
        // Find line segments where the value crosses the threshold
        for (let m = 0; m < 4; m++) {
          const n = (m + 1) % 4;
          
          if ((cell[m].value < threshold && cell[n].value >= threshold) ||
              (cell[m].value >= threshold && cell[n].value < threshold)) {
            // Linear interpolation to find exact crossing point
            const t = (threshold - cell[m].value) / (cell[n].value - cell[m].value);
            const x = cell[m].x + t * (cell[n].x - cell[m].x);
            const y = cell[m].y + t * (cell[n].y - cell[m].y);
            
            lines.push({ x, y });
          }
        }
      }
    }
    
    contours.push({ level: threshold, points: lines });
  }
  
  return contours;
};

/**
 * Calculates gradient of the loss landscape at a specific point
 * Enhanced with Monte Carlo perturbation for more realistic training dynamics
 * 
 * @param {Array} grid - 2D array of loss values
 * @param {number} x - X coordinate (col)
 * @param {number} y - Y coordinate (row)
 * @param {number} noiseLevel - Level of gradient noise (0-1)
 * @returns {Object} - Gradient vector { dx, dy }
 */
export const calculateGradient = (grid, x, y, noiseLevel = 0.1) => {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Ensure coordinates are within bounds
  const row = Math.min(Math.max(Math.floor(y), 1), rows - 2);
  const col = Math.min(Math.max(Math.floor(x), 1), cols - 2);
  
  // Calculate partial derivatives using central difference
  let dx = (grid[row][col + 1] - grid[row][col - 1]) / 2;
  let dy = (grid[row + 1][col] - grid[row - 1][col]) / 2;
  
  // Add Monte Carlo noise to gradient (simulates minibatch stochasticity in SGD)
  if (noiseLevel > 0) {
    dx += boxMullerTransform() * noiseLevel * Math.abs(dx);
    dy += boxMullerTransform() * noiseLevel * Math.abs(dy);
  }
  
  // Return gradient vector (negative for descending, positive for ascending)
  return { dx, dy };
};

/**
 * Generates gradient flow vectors at regular points in the grid
 * 
 * @param {Array} grid - 2D array of loss values
 * @param {number} spacing - Space between gradient vectors
 * @returns {Array} - Array of gradient vectors with positions and directions
 */
export const generateGradientField = (grid, spacing = 10) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const gradients = [];
  
  for (let i = spacing; i < rows; i += spacing) {
    for (let j = spacing; j < cols; j += spacing) {
      const { dx, dy } = calculateGradient(grid, j, i, 0); // No noise for visualization
      
      // Only include significant gradients
      if (dx*dx + dy*dy > 0.0001) {
        gradients.push({
          x: j,
          y: i,
          dx,
          dy,
          magnitude: Math.sqrt(dx*dx + dy*dy)
        });
      }
    }
  }
  
  return gradients;
};

/**
 * Simulates one step in adversarial training with realistic dynamics
 * 
 * @param {Object} defender - Current defender position {x, y}
 * @param {Object} adversary - Current adversary position {x, y}
 * @param {Array} grid - 2D loss landscape
 * @param {number} defenseStrength - How strong the defender's updates are
 * @param {number} attackStrength - How strong the adversary's updates are
 * @returns {Object} - Updated positions for both players and adjusted loss values
 */
export const simulateStep = (defender, adversary, grid, defenseStrength, attackStrength) => {
  // Calculate gradients at current positions with Monte Carlo noise
  // Adversary gets less noise when it's stronger (better optimization)
  const strengthRatio = attackStrength / defenseStrength;
  const adversaryNoiseLevel = strengthRatio > 1 ? 0.04 : 0.08; // Reduced noise when adversary is stronger
  const defenderNoiseLevel = strengthRatio > 1 ? 0.08 : 0.05; // Increased noise when defender is weaker
  
  const defenderGradient = calculateGradient(grid, defender.x, defender.y, defenderNoiseLevel);
  const adversaryGradient = calculateGradient(grid, adversary.x, adversary.y, adversaryNoiseLevel);
  
  // Adaptive step sizes based on gradient magnitudes and strengths
  const defMagnitude = Math.sqrt(defenderGradient.dx * defenderGradient.dx + defenderGradient.dy * defenderGradient.dy);
  const advMagnitude = Math.sqrt(adversaryGradient.dx * adversaryGradient.dx + adversaryGradient.dy * adversaryGradient.dy);
  
  // Adaptive scaling (larger steps in flat regions, smaller in steep regions)
  const defScale = 0.02 * defenseStrength / (0.1 + defMagnitude);
  
  // Adversary gets better step size adaptation when it's stronger
  const advScale = strengthRatio > 1 
    ? 0.025 * attackStrength / (0.05 + advMagnitude) // More aggressive steps when stronger
    : 0.02 * attackStrength / (0.1 + advMagnitude);  // Normal steps otherwise
  
  // Update positions (defender descends, adversary ascends)
  // Add momentum for more realistic optimization paths
  const defenderMomentum = 0.2;
  const adversaryMomentum = strengthRatio > 1 ? 0.3 : 0.2; // More momentum when stronger
  
  // Calculate defense vector with momentum (if history exists)
  let defDx = -defenderGradient.dx * defScale;
  let defDy = -defenderGradient.dy * defScale;
  
  // Calculate attack vector with momentum (if history exists)
  let advDx = adversaryGradient.dx * advScale;
  let advDy = adversaryGradient.dy * advScale;
  
  // Apply the updates
  const newDefender = {
    x: defender.x + defDx,
    y: defender.y + defDy
  };
  
  const newAdversary = {
    x: adversary.x + advDx,
    y: adversary.y + advDy
  };
  
  // Apply inner minimization constraint - adversary can only move within a certain radius of current position
  // This simulates the perturbation budget in adversarial examples
  // The perturbation budget increases when the adversary is stronger
  const maxPerturbation = 0.2 * attackStrength * (strengthRatio > 1 ? 1.2 : 1.0);
  const advDist = Math.sqrt(advDx*advDx + advDy*advDy);
  
  if (advDist > maxPerturbation) {
    const scale = maxPerturbation / advDist;
    newAdversary.x = adversary.x + advDx * scale;
    newAdversary.y = adversary.y + advDy * scale;
  }
  
  // If adversary is stronger, occasionally make it jump toward the defender
  // This simulates targeted attacks that efficiently find the defender's weaknesses
  if (strengthRatio > 1 && Math.random() < 0.08) { // 8% chance of a targeted move
    const targetJump = 0.15; // How far toward the defender to jump
    const dirX = defender.x - adversary.x;
    const dirY = defender.y - adversary.y;
    const dirMag = Math.sqrt(dirX*dirX + dirY*dirY);
    
    if (dirMag > 0) {
      newAdversary.x += (dirX / dirMag) * targetJump * maxPerturbation;
      newAdversary.y += (dirY / dirMag) * targetJump * maxPerturbation;
    }
  }
  
  // Keep within reasonable bounds
  const rows = grid.length;
  const cols = grid[0].length;
  
  newDefender.x = Math.min(Math.max(newDefender.x, 0), cols - 1);
  newDefender.y = Math.min(Math.max(newDefender.y, 0), rows - 1);
  newAdversary.x = Math.min(Math.max(newAdversary.x, 0), cols - 1);
  newAdversary.y = Math.min(Math.max(newAdversary.y, 0), rows - 1);
  
  return { defender: newDefender, adversary: newAdversary };
};

/**
 * Calculates a dynamic adversarial loss based on player positions
 * This is more realistic than just using the grid value directly
 * 
 * @param {Array} grid - Loss landscape grid
 * @param {Object} defender - Defender position {x, y}
 * @param {Object} adversary - Adversary position {x, y}
 * @param {number} iteration - Current iteration counter
 * @param {number} defenseStrength - Defender's strength parameter
 * @param {number} attackStrength - Adversary's strength parameter
 * @returns {Object} - Updated loss values for defender and adversary
 */
export const calculateDynamicLoss = (grid, defender, adversary, iteration, defenseStrength = 5, attackStrength = 5) => {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Ensure coordinates are within bounds
  const defRow = Math.min(Math.max(Math.floor(defender.y), 0), rows - 1);
  const defCol = Math.min(Math.max(Math.floor(defender.x), 0), cols - 1);
  const advRow = Math.min(Math.max(Math.floor(adversary.y), 0), rows - 1);
  const advCol = Math.min(Math.max(Math.floor(adversary.x), 0), cols - 1);
  
  // Base loss from landscape
  const baseLoss = grid[defRow][defCol];
  
  // Calculate distance between defender and adversary
  const dx = (defender.x - adversary.x) / cols;
  const dy = (defender.y - adversary.y) / rows;
  const distance = Math.sqrt(dx*dx + dy*dy);
  
  // In adversarial training, the loss depends on both positions:
  // - Defender wants to minimize loss at its position
  // - Adversary wants to maximize loss at defender's position
  
  // Learning progress factor (loss should decrease over time due to learning)
  const learningFactor = Math.max(0.1, 1.0 - iteration / 500);
  
  // Calculate adversarial influence (decreases with distance)
  const influenceRange = 0.3; // Max distance for adversarial influence
  const influence = Math.max(0, 1.0 - distance / influenceRange);
  
  // Dynamic adversarial component (oscillates to simulate the minimax game)
  const oscillation = 0.1 * Math.sin(iteration / 10);
  
  // Calculate the strength ratio to determine the balance between adversary and defender
  const strengthRatio = attackStrength / defenseStrength;
  
  // When adversary is stronger, it should reduce its own loss while increasing defender's loss
  const strengthAdvantage = Math.max(0, strengthRatio - 1) * 0.15; // Advantage factor scales with ratio
  
  // Calculate final loss values
  let defenderLoss = (
    baseLoss * 0.7 + // Base landscape component
    influence * 0.2 + // Adversary influence
    oscillation + // Dynamic component
    boxMullerTransform() * 0.03 // Small noise
  ) * learningFactor;
  
  let adversaryLoss = (
    grid[advRow][advCol] * 0.3 + // Base landscape at adversary position
    baseLoss * 0.4 + // Component from defender's position
    influence * 0.2 + // Proximity effect
    oscillation + // Dynamic component
    boxMullerTransform() * 0.05 // Slightly more noise for adversary
  ) * learningFactor;
  
  // Apply strength advantage: If adversary is stronger, increase defender loss and decrease adversary loss
  if (strengthRatio > 1) {
    defenderLoss = Math.min(defenderLoss * (1 + strengthAdvantage), 1);
    adversaryLoss = Math.max(adversaryLoss * (1 - strengthAdvantage), 0);
    
    // Add oscillation that increases with iteration to show the growing gap when adversary is stronger
    if (iteration > 50) {
      const growingGap = Math.min(0.3, (iteration - 50) / 500); // Caps at 0.3
      defenderLoss = Math.min(defenderLoss + growingGap * Math.sin(iteration / 30), 1);
    }
  }
  
  return {
    defenderLoss: Math.min(Math.max(defenderLoss, 0), 1),
    adversaryLoss: Math.min(Math.max(adversaryLoss, 0), 1)
  };
};

/**
 * Maps a value from the range [0,1] to a color in a gradient
 * 
 * @param {number} value - Value to map [0,1]
 * @returns {string} - RGB color string
 */
export const getLossColor = (value) => {
  // Define gradient colors (from low to high)
  const colors = [
    { r: 245, g: 167, b: 66 },  // var(--gradient-start)
    { r: 230, g: 190, b: 120 }, // midpoint 1
    { r: 180, g: 210, b: 170 }, // midpoint 2
    { r: 66, g: 245, b: 209 }   // var(--gradient-end)
  ];
  
  const numColors = colors.length;
  const position = value * (numColors - 1);
  const index = Math.floor(position);
  const t = position - index;
  
  // Handle edge cases
  if (index >= numColors - 1) return `rgb(${colors[numColors - 1].r}, ${colors[numColors - 1].g}, ${colors[numColors - 1].b})`;
  if (index < 0) return `rgb(${colors[0].r}, ${colors[0].g}, ${colors[0].b})`;
  
  // Linear interpolation between two colors
  const r = Math.round(colors[index].r + t * (colors[index + 1].r - colors[index].r));
  const g = Math.round(colors[index].g + t * (colors[index + 1].g - colors[index].g));
  const b = Math.round(colors[index].b + t * (colors[index + 1].b - colors[index].b));
  
  return `rgb(${r}, ${g}, ${b})`;
}; 