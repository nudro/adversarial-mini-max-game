# Adversarial Min-Max Game Visualization

This project is a simulation and visualization tool that demonstrates the dynamics of adversarial training in machine learning. It provides an intuitive representation of the min-max game between a defender (e.g., a classifier) and an adversary (e.g., an attack algorithm).

## 🚨 Simulation Notice

**This is a SIMULATION ONLY.** The visualization is intended for educational purposes to help understand the concepts of adversarial machine learning. It does not connect to actual machine learning models or represent a specific implementation of adversarial training.

## 📖 Overview

The visualization shows:

1. A loss landscape represented as a colorful gradient
2. The defender (blue) attempts to minimize its loss by moving downward
3. The adversary (red) attempts to maximize the defender's loss
4. Dynamic changes in loss values based on player positions and strengths
5. Visual indicators of advantage when one player is stronger than the other

## 🔍 Technical Implementation

### Key Components

- **Loss Landscape Generation:** Combines Gaussian peaks, saddle points, and Monte Carlo perturbations to create a realistic loss surface with critical points
- **Gradient Calculation:** Implements central difference method with stochastic noise to simulate SGD dynamics
- **Dynamic Loss Calculation:** Computes adaptive loss values based on player positions, iteration, and relative strengths
- **Simulation Logic:** Models realistic optimization behaviors including momentum, adaptive step sizes, and perturbation constraints

### Mathematics Used

1. **Gaussian Functions:** Used to create peaks and valleys in the loss landscape
2. **Saddle Points:** Implemented as `x²/a² - y²/b²` to create unstable equilibria
3. **Box-Muller Transform:** Generates normally distributed random values for realistic gradient noise
4. **Gibbs Sampling:** Smooths the landscape to simulate local correlations in loss surfaces
5. **Central Difference Method:** Calculates gradient approximations

### Visualization Features

- Contour lines represent equal loss values
- Gradient vectors show the direction and magnitude of steepest descent
- History paths track both players' movements
- Real-time loss graph shows how loss values evolve over iterations
- Visual effects highlight when the adversary has an advantage
- Adaptive player sizes and strength rings indicate relative power

## 🧠 Key ML Concepts Illustrated

- **Gradient Descent:** The defender follows the negative gradient to minimize loss
- **Adversarial Training:** The adversary tries to maximize the defender's loss
- **Min-Max Game:** The competitive dynamic between minimizing and maximizing objectives
- **Strength Imbalance:** Shows how a stronger adversary can find more effective attacks
- **Stochastic Optimization:** Simulates the noise and uncertainty in real training
- **Perturbation Budget:** Limits how far the adversary can move in a single step

## 📊 Implementation Details

The project is built with:
- React for the UI components
- D3.js for data visualization helpers
- Canvas API for high-performance rendering
- Styled Components for styling

Key implementation files:
- `src/utils/gameUtils.js`: Core simulation logic and mathematical functions
- `src/components/MinMaxGame.jsx`: Main visualization component
- `src/components/InfoPanel.jsx`: Educational content about adversarial concepts

## 🔮 Assumptions

- The loss landscape is a simplified 2D representation of a typically high-dimensional space
- The simulation uses a fixed grid resolution to balance performance and visual fidelity
- Stochastic noise levels are set to illustrate concepts clearly rather than match specific ML implementations
- The simulation prioritizes visual intuitiveness over exact mathematical precision
- The concept of "strength" is an abstraction representing factors like model capacity or attack effectiveness

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Open http://localhost:3000 in your browser

## 🌐 License

This project is available under the MIT License. 