import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { locale } = body

        if (!['en', 'ar'].includes(locale)) {
            return NextResponse.json(
                { success: false, error: 'Invalid locale' },
                { status: 400 }
            )
        }

        const cookieStore = await cookies()
        cookieStore.set('locale', locale, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365, // 1 year
        })

        return NextResponse.json({
            success: true,
            message: 'Language updated successfully',
        })
    } catch (error) {
        console.error('Error setting language:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to set language' },
            { status: 500 }
        )
    }
}
