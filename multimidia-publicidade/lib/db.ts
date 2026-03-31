import { neon } from '@neondatabase/serverless'

// DATABASE_URL must include ?options=-csearch_path%3Dmultimidia
const sql = neon(process.env.DATABASE_URL!)
export { sql }
