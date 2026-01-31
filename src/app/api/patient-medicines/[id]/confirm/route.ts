import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// PUT /api/patient-medicines/[id]/confirm - Confirm medicine intake
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session || session.user.role !== 'PATIENT') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify the medicine belongs to this patient
        const patientMedicine = await prisma.patientMedicine.findUnique({
            where: { id },
            include: {
                patient: true,
            },
        })

        if (!patientMedicine || patientMedicine.patient.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Medicine not found or unauthorized' },
                { status: 404 }
            )
        }

        const updated = await prisma.patientMedicine.update({
            where: { id },
            data: { confirmed: true },
        })

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Medicine intake confirmed',
        })
    } catch (error) {
        console.error('Error confirming medicine:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to confirm medicine' },
            { status: 500 }
        )
    }
}
