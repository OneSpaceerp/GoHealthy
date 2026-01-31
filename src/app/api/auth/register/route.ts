import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

// Force dynamic to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, name, role } = body

        // Validate required fields
        if (!email || !password || !name) {
            return NextResponse.json(
                { success: false, error: 'Email, password, and name are required' },
                { status: 400 }
            )
        }

        // Validate role
        const validRoles = ['DOCTOR', 'PATIENT']
        if (role && !validRoles.includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Invalid role' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                role: role || 'PATIENT',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                language: true,
                createdAt: true,
            },
        })

        // If user is a patient, create patient profile
        if (user.role === 'PATIENT') {
            await prisma.patient.create({
                data: {
                    userId: user.id,
                    fullName: name,
                    age: 0,
                    gender: 'MALE',
                    height: 0,
                    weight: 0,
                },
            })
        }

        return NextResponse.json({
            success: true,
            data: user,
            message: 'Account created successfully',
        })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { success: false, error: 'An error occurred during registration' },
            { status: 500 }
        )
    }
}
