import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// Force dynamic to prevent build-time execution
export const dynamic = 'force-dynamic'

// GET /api/nutrition-plans - List nutrition plans
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
        } else if (session.user.role === 'PATIENT') {
            const patient = await prisma.patient.findUnique({
                where: { userId: session.user.id },
            })
            if (patient) {
                where = { patientId: patient.id }
            }
        }

        const [plans, total] = await Promise.all([
            prisma.nutritionPlan.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    doctor: {
                        select: { name: true },
                    },
                    patient: {
                        select: { fullName: true },
                    },
                },
            }),
            prisma.nutritionPlan.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: plans,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching nutrition plans:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch nutrition plans' },
            { status: 500 }
        )
    }
}

// POST /api/nutrition-plans - Create nutrition plan
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
        const {
            title,
            description,
            meals,
            totalCalories,
            proteinGrams,
            carbsGrams,
            fatsGrams,
            allowedFoods,
            restrictedFoods,
            supplements,
            startDate,
            endDate,
            patientId,
        } = body

        if (!title || !totalCalories || !proteinGrams || !carbsGrams || !fatsGrams) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // If assigning to patient, remove from previous plan
        if (patientId) {
            await prisma.nutritionPlan.updateMany({
                where: { patientId },
                data: { patientId: null },
            })
        }

        const plan = await prisma.nutritionPlan.create({
            data: {
                doctorId: session.user.id,
                title,
                description,
                meals: meals || [],
                totalCalories: parseInt(totalCalories),
                proteinGrams: parseInt(proteinGrams),
                carbsGrams: parseInt(carbsGrams),
                fatsGrams: parseInt(fatsGrams),
                allowedFoods,
                restrictedFoods,
                supplements,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                patientId,
            },
            include: {
                patient: {
                    select: { fullName: true },
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: plan,
            message: 'Nutrition plan created successfully',
        })
    } catch (error) {
        console.error('Error creating nutrition plan:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create nutrition plan' },
            { status: 500 }
        )
    }
}
