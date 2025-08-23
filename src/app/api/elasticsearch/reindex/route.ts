import { NextRequest, NextResponse } from 'next/server'
import { indexAllParts } from '@/lib/indexing'

export async function POST(request: NextRequest) {
  try {
    const result = await indexAllParts()
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    })
  } catch (error) {
    console.error('Error in reindex endpoint:', error)
    return NextResponse.json(
      { success: false, message: 'Reindexing failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger reindexing',
    endpoint: '/api/elasticsearch/reindex'
  })
}