import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { canAccessPatient } from '@/lib/auth'

// Force dynamic to prevent build-time execution
export const dynamic = 'force-dynamic'

// GET /api/patients/[id] - Get patient details
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
            include: {
                user: {
                    select: { email: true, name: true },
                },
                doctor: {
                    select: { name: true, email: true },
                },
                measurements: {
                    orderBy: { createdAt: 'desc' },
                },
                images: {
                    orderBy: { uploadedAt: 'desc' },
                },
                nutritionPlan: true,
                medicines: {
                    include: { medicine: true },
                },
            },
        })

        if (!patient) {
            return NextResponse.json(
                { success: false, error: 'Patient not found' },
                { status: 404 }
            )
        }

        // Check access
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

        return NextResponse.json({
            success: true,
            data: patient,
        })
    } catch (error) {
        console.error('Error fetching patient:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch patient' },
            { status: 500 }
        )
    }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(
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

        // Check access
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

        const body = await request.json()
        const {
            fullName,
            age,
            gender,
            height,
            weight,
            medicalConditions,
            allergies,
            currentMedications,
            notes,
            doctorId,
        } = body

        const updatedPatient = await prisma.patient.update({
            where: { id },
            data: {
                fullName,
                age: age ? parseInt(age) : undefined,
                gender,
                height: height ? parseFloat(height) : undefined,
                weight: weight ? parseFloat(weight) : undefined,
                medicalConditions,
                allergies,
                currentMedications,
                notes,
                doctorId: session.user.role === 'ADMIN' ? doctorId : undefined,
            },
            include: {
                user: {
                    select: { email: true },
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: updatedPatient,
            message: 'Patient updated successfully',
        })
    } catch (error) {
        console.error('Error updating patient:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update patient' },
            { status: 500 }
        )
    }
}

// DELETE /api/patients/[id] - Delete patient
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        await prisma.patient.delete({
            where: { id },
        })

        return NextResponse.json({
            success: true,
            message: 'Patient deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting patient:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete patient' },
            { status: 500 }
        )
    }
}
