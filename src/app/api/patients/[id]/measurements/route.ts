import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { canAccessPatient } from '@/lib/auth'

// GET /api/patients/[id]/measurements - Get patient measurements
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const patient = await prisma.patient.findUnique({
            where: { id },
        })

        if (!patient) {
            return NextResponse.json(
                { success: false, error: 'Patient not found' },
                { status: 404 }
            )
        }

        const hasAccess = canAccessPatient(
            session.user.role as 'ADMIN' | 'DOCTOR' | 'PATIENT',
            session.user.id,
            patient.userId,
            patient.doctorId
        )

        if (!hasAccess) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const measurements = await prisma.measurement.findMany({
            where: { patientId: id },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({
            success: true,
            data: measurements,
        })
    } catch (error) {
        console.error('Error fetching measurements:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch measurements' },
            { status: 500 }
        )
    }
}

// POST /api/patients/[id]/measurements - Add measurement
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const patient = await prisma.patient.findUnique({
            where: { id },
        })

        if (!patient) {
            return NextResponse.json(
                { success: false, error: 'Patient not found' },
                { status: 404 }
            )
        }

        // Only patient can add their own measurements
        if (session.user.role === 'PATIENT' && patient.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const {
            dayType,
            weight,
            armCircumference,
            waistOnNavel,
            waistAboveNavel,
            hipCircumference,
            thighCircumference,
            notes,
        } = body

        if (!dayType) {
            return NextResponse.json(
                { success: false, error: 'Day type is required' },
                { status: 400 }
            )
        }

        // Check if measurement for this day already exists
        const existingMeasurement = await prisma.measurement.findFirst({
            where: {
                patientId: id,
                dayType,
            },
        })

        if (existingMeasurement) {
            // Update existing measurement
            const updatedMeasurement = await prisma.measurement.update({
                where: { id: existingMeasurement.id },
                data: {
                    weight: weight ? parseFloat(weight) : undefined,
                    armCircumference: armCircumference ? parseFloat(armCircumference) : undefined,
                    waistOnNavel: waistOnNavel ? parseFloat(waistOnNavel) : undefined,
                    waistAboveNavel: waistAboveNavel ? parseFloat(waistAboveNavel) : undefined,
                    hipCircumference: hipCircumference ? parseFloat(hipCircumference) : undefined,
                    thighCircumference: thighCircumference ? parseFloat(thighCircumference) : undefined,
                    notes,
                    measuredAt: new Date(),
                },
            })

            return NextResponse.json({
                success: true,
                data: updatedMeasurement,
                message: 'Measurement updated successfully',
            })
        }

        const measurement = await prisma.measurement.create({
            data: {
                patientId: id,
                dayType,
                weight: weight ? parseFloat(weight) : null,
                armCircumference: armCircumference ? parseFloat(armCircumference) : null,
                waistOnNavel: waistOnNavel ? parseFloat(waistOnNavel) : null,
                waistAboveNavel: waistAboveNavel ? parseFloat(waistAboveNavel) : null,
                hipCircumference: hipCircumference ? parseFloat(hipCircumference) : null,
                thighCircumference: thighCircumference ? parseFloat(thighCircumference) : null,
                notes,
            },
        })

        return NextResponse.json({
            success: true,
            data: measurement,
            message: 'Measurement added successfully',
        })
    } catch (error) {
        console.error('Error adding measurement:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to add measurement' },
            { status: 500 }
        )
    }
}
