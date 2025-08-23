#!/usr/bin/env node

import { indexAllParts } from '../lib/indexing'

async function main() {
  console.log('🔍 Starting Elasticsearch reindexing...')
  
  try {
    const result = await indexAllParts()
    
    if (result.success) {
      console.log('✅ ' + result.message)
      process.exit(0)
    } else {
      console.error('❌ ' + result.message)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Reindexing failed:', error)
    process.exit(1)
  }
}

main()