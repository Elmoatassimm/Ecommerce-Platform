#!/usr/bin/env node

/**
 * Messenger Order Simulation Runner
 * 
 * This script runs the Messenger order simulation test.
 * It sets up the environment and runs the test with proper error handling.
 * 
 * Usage: node scripts/run-messenger-simulation.js
 */

require('dotenv').config();
const { runOrderSimulation } = require('../tests/messenger-order-simulation.test');

// Check if required environment variables are set
const requiredEnvVars = [
  'DATABASE_URL',
  'PAGE_ACCESS_TOKEN',
  'VERIFY_TOKEN'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease set these variables in your .env file and try again.');
  process.exit(1);
}

// Run the simulation
console.log('🚀 Starting Messenger Order Simulation');
console.log('======================================');
console.log('Environment: ', process.env.NODE_ENV || 'development');
console.log('Database: ', process.env.DATABASE_URL.split('@')[1]); // Show only host part for security
console.log('======================================\n');

runOrderSimulation()
  .then(() => {
    console.log('\n✨ Simulation completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Simulation failed with error:', error);
    process.exit(1);
  });
