
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function setupDatabase() {
  try {
    console.log('Setting up database using TypeScript setup script...');
    
    // Use ts-node to run the TypeScript setup file
    const { stdout, stderr } = await execPromise('npx ts-node -e "import(\\"./scripts/setupDatabase.ts\\").then(m => m.setupDatabase())"');
    
    if (stderr) {
      console.error('Setup errors:', stderr);
    }
    
    if (stdout) {
      console.log('Setup output:', stdout);
    }
    
    console.log('Database setup completed!');
    
  } catch (error) {
    console.error('Setup failed:', error.message);
    
    // Fallback: try with node directly on compiled JS
    console.log('Trying alternative approach...');
    try {
      // Install ts-node if not available
      await execPromise('npm install --save-dev ts-node');
      console.log('ts-node installed, retrying...');
      
      const { stdout: stdout2, stderr: stderr2 } = await execPromise('npx ts-node scripts/setupDatabase.ts');
      
      if (stderr2) {
        console.error('Alternative setup errors:', stderr2);
      }
      
      if (stdout2) {
        console.log('Alternative setup output:', stdout2);
      }
      
    } catch (altError) {
      console.error('Alternative setup also failed:', altError.message);
    }
  }
}

// Run setup
setupDatabase();
