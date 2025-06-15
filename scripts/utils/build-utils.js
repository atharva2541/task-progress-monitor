
import { execSync } from 'child_process';

export function buildFrontend() {
  console.log('📦 Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
}
