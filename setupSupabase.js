
const fs = require('fs');
const path = require('path');

// Read and execute SQL file
async function setupDatabase() {
  try {
    // Import supabase client
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = 'https://fofaqsowmxvwjqnphsgq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZmFxc293bXh2d2pxbnBoc2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njk2NjgsImV4cCI6MjA2OTU0NTY2OH0.4ltXloprgcF_qQjU1FjhMgsJy5spwZQxf8W1xWz5PSg';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'import_data.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'COMMIT');
    
    console.log('Setting up database...');
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log('Executing:', statement.substring(0, 50) + '...');
          const { error } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (error) {
            console.error('Error executing statement:', error);
          } else {
            console.log('✓ Statement executed successfully');
          }
        } catch (err) {
          console.error('Error:', err.message);
        }
      }
    }
    
    console.log('Database setup completed!');
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Run setup
setupDatabase();
