import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })

  const userId = (session.user as any).id

  const investments = await prisma.investment.findMany({
    where: { 
      userId,
      status: 'ACTIVE'
    },
    include: {
      plan: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(investments)
}
