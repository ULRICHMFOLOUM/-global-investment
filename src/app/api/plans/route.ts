import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const category = searchParams.get('category')

    const plans = await prisma.plan.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: { minAmount: 'asc' },
    })
    
    return NextResponse.json(plans)
  } catch (error: any) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ 
      error: 'Erreur Serveur', 
      details: error.message,
    }, { status: 500 })
  }
}
