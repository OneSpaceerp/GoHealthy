import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// Force dynamic to prevent build-time execution
export const dynamic = 'force-dynamic'

// GET /api/patients - List patients
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
        const search = searchParams.get('search') || ''

        let where = {}

        // Role-based filtering
        if (session.user.role === 'DOCTOR') {
            where = { doctorId: session.user.id }
        } else if (session.user.role === 'PATIENT') {
            where = { userId: session.user.id }
        }

        // Search filter
        if (search) {
            where = {
                ...where,
                OR: [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                ],
            }
        }

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { email: true },
                    },
                    doctor: {
                        select: { name: true },
                    },
                    measurements: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            }),
            prisma.patient.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: patients,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching patients:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch patients' },
            { status: 500 }
        )
    }
}

// POST /api/patients - Create patient
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
            userId,
            fullName,
            age,
            gender,
            height,
            weight,
            medicalConditions,
            allergies,
            currentMedications,
            notes,
        } = body

        // Validate required fields
        if (!userId || !fullName || !age || !gender || !height || !weight) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check if patient already exists
        const existingPatient = await prisma.patient.findUnique({
            where: { userId },
        })

        if (existingPatient) {
            return NextResponse.json(
                { success: false, error: 'Patient profile already exists' },
                { status: 400 }
            )
        }

        const patient = await prisma.patient.create({
            data: {
                userId,
                fullName,
                age: parseInt(age),
                gender,
                height: parseFloat(height),
                weight: parseFloat(weight),
                medicalConditions,
                allergies,
                currentMedications,
                notes,
                doctorId: session.user.role === 'DOCTOR' ? session.user.id : null,
            },
            include: {
                user: {
                    select: { email: true },
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: patient,
            message: 'Patient created successfully',
        })
    } catch (error) {
        console.error('Error creating patient:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create patient' },
            { status: 500 }
        )
    }
}
