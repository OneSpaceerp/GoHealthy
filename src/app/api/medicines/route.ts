import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// Force dynamic to prevent build-time execution
export const dynamic = 'force-dynamic'

// GET /api/medicines - List medicines
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        let where = {}

        if (session.user.role === 'DOCTOR') {
            where = { doctorId: session.user.id }
        }

        const [medicines, total] = await Promise.all([
            prisma.medicine.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    doctor: {
                        select: { name: true },
                    },
                    _count: {
                        select: { patients: true },
                    },
                },
            }),
            prisma.medicine.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: medicines,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching medicines:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch medicines' },
            { status: 500 }
        )
    }
}

// POST /api/medicines - Create medicine
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !['ADMIN', 'DOCTOR'].includes(session.user.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name, description } = body

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Medicine name is required' },
                { status: 400 }
            )
        }

        const medicine = await prisma.medicine.create({
            data: {
                doctorId: session.user.id,
                name,
                description,
            },
        })

        return NextResponse.json({
            success: true,
            data: medicine,
            message: 'Medicine created successfully',
        })
    } catch (error) {
        console.error('Error creating medicine:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create medicine' },
            { status: 500 }
        )
    }
}
