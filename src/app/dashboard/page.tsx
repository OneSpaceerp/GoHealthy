import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    // Redirect based on role
    const role = session.user.role
    if (role === 'ADMIN') {
        redirect('/dashboard/admin')
    } else if (role === 'DOCTOR') {
        redirect('/dashboard/doctor')
    } else {
        redirect('/dashboard/patient')
    }
}
