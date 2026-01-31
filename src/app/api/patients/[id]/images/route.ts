import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { canAccessPatient } from '@/lib/auth'

// GET /api/patients/[id]/images - Get patient images
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

        const images = await prisma.patientImage.findMany({
            where: { patientId: id },
            orderBy: { uploadedAt: 'desc' },
        })

        return NextResponse.json({
            success: true,
            data: images,
        })
    } catch (error) {
        console.error('Error fetching images:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch images' },
            { status: 500 }
        )
    }
}

// POST /api/patients/[id]/images - Upload image
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

        // Only patient can upload their own images
        if (session.user.role === 'PATIENT' && patient.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const dayType = formData.get('dayType') as string
        const imageType = formData.get('imageType') as string
        const notes = formData.get('notes') as string

        if (!file || !dayType || !imageType) {
            return NextResponse.json(
                { success: false, error: 'File, dayType, and imageType are required' },
                { status: 400 }
            )
        }

        // Create uploads directory
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'patients', id)
        await mkdir(uploadsDir, { recursive: true })

        // Generate unique filename
        const timestamp = Date.now()
        const extension = file.name.split('.').pop()
        const filename = `${dayType}_${imageType}_${timestamp}.${extension}`
        const filepath = join(uploadsDir, filename)

        // Write file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Save to database
        const imagePath = `/uploads/patients/${id}/${filename}`
        const image = await prisma.patientImage.create({
            data: {
                patientId: id,
                dayType: dayType as 'DAY_1' | 'DAY_15' | 'DAY_30',
                imageType: imageType as 'FRONT' | 'SIDE' | 'BACK',
                imagePath,
                notes,
            },
        })

        return NextResponse.json({
            success: true,
            data: image,
            message: 'Image uploaded successfully',
        })
    } catch (error) {
        console.error('Error uploading image:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to upload image' },
            { status: 500 }
        )
    }
}
