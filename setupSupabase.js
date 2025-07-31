
import { setupDatabase } from './scripts/setupDatabase.ts'

console.log('Setting up Supabase database...')
setupDatabase()
  .then(() => {
    console.log('Database setup completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Database setup failed:', error)
    process.exit(1)
  })
