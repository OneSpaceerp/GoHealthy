import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Role } from '@prisma/client'

export async function getSession() {
    return await getServerSession(authOptions)
}

export async function getCurrentUser() {
    const session = await getSession()
    return session?.user
}

export function hasRole(userRole: Role, requiredRoles: Role[]): boolean {
    return requiredRoles.includes(userRole)
}

export function canAccessPatient(
    userRole: Role,
    userId: string,
    patientUserId: string,
    patientDoctorId?: string | null
): boolean {
    if (userRole === 'ADMIN') return true
    if (userRole === 'DOCTOR' && patientDoctorId === userId) return true
    if (userRole === 'PATIENT' && patientUserId === userId) return true
    return false
}
