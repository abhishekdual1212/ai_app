const { execSync } = require('child_process');

console.log('Testing Vite...');

try {
  const result = execSync('npx vite --version', { encoding: 'utf8' });
  console.log('Vite version:', result.trim());
} catch (error) {
  console.error('Vite error:', error.message);
}

try {
  const result = execSync('npx vite --help', { encoding: 'utf8' });
  console.log('Vite help available');
} catch (error) {
  console.error('Vite help error:', error.message);
}
