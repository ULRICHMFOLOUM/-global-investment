import { NextRequest, NextResponse } from 'next/server'
import { processDailyGains } from '@/lib/gains'

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const result = await processDailyGains()
    return NextResponse.json({
      success: true,
      message: 'Gains journaliers vérifiés et distribués automatiquement',
      ...result,
    })
  } catch (error: any) {
    console.error('Cron gains error:', error)
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 })
  }
}

