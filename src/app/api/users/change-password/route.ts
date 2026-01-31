import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { compare, hash } from 'bcryptjs'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

// PUT /api/users/change-password - Change user password
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { currentPassword, newPassword, confirmPassword } = body

        // Validate inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            )
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'New passwords do not match' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // Verify current password
        const isValid = await compare(currentPassword, user.password)

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Current password is incorrect' },
                { status: 400 }
            )
        }

        // Hash new password and update
        const hashedPassword = await hash(newPassword, 12)

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        })

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully',
        })
    } catch (error) {
        console.error('Error changing password:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to change password' },
            { status: 500 }
        )
    }
}
