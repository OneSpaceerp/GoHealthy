import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import styles from './doctor.module.css'

export default async function DoctorDashboard() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'DOCTOR') {
        redirect('/dashboard')
    }

    const t = await getTranslations()

    // Get doctor's data
    const [totalPatients, activePlans, totalMedicines] = await Promise.all([
        prisma.patient.count({ where: { doctorId: session.user.id } }),
        prisma.nutritionPlan.count({ where: { doctorId: session.user.id, isActive: true } }),
        prisma.medicine.count({ where: { doctorId: session.user.id } }),
    ])

    const recentPatients = await prisma.patient.findMany({
        where: { doctorId: session.user.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { email: true },
            },
            measurements: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
    })

    return (
        <div className={styles.page}>
            <div className="page-header">
                <h1 className="page-title">{t('nav.dashboard')}</h1>
                <p className="page-subtitle">{t('dashboard.welcomeBack')}, {session.user.name}</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className="stat-card">
                    <div className="stat-card-icon primary">🧑</div>
                    <div className="stat-card-value">{totalPatients}</div>
                    <div className="stat-card-label">{t('dashboard.totalPatients')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon success">🥗</div>
                    <div className="stat-card-value">{activePlans}</div>
                    <div className="stat-card-label">{t('dashboard.activePlans')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon info">💊</div>
                    <div className="stat-card-value">{totalMedicines}</div>
                    <div className="stat-card-label">{t('medicines.title')}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={`card ${styles.quickActions}`}>
                <div className="card-header">
                    <h2 className="card-title">{t('dashboard.quickActions')}</h2>
                </div>
                <div className="card-body">
                    <div className={styles.actionButtons}>
                        <Link href="/dashboard/doctor/patients" className="btn btn-primary">
                            👥 {t('nav.patients')}
                        </Link>
                        <Link href="/dashboard/doctor/nutrition-plans/new" className="btn btn-secondary">
                            ➕ {t('nutrition.createPlan')}
                        </Link>
                        <Link href="/dashboard/doctor/medicines" className="btn btn-secondary">
                            💊 {t('medicines.addMedicine')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Patients */}
            <div className="card mt-6">
                <div className="card-header flex justify-between items-center">
                    <h2 className="card-title">{t('patient.patientList')}</h2>
                    <Link href="/dashboard/doctor/patients" className="btn btn-sm btn-outline">
                        {t('common.view')} →
                    </Link>
                </div>
                <div className="card-body">
                    {recentPatients.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t('patient.fullName')}</th>
                                        <th>{t('patient.age')}</th>
                                        <th>{t('patient.gender')}</th>
                                        <th>{t('measurements.weight')}</th>
                                        <th>{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPatients.map((patient) => (
                                        <tr key={patient.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-sm">
                                                        {patient.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{patient.fullName}</div>
                                                        <div className="text-sm text-muted">{patient.user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{patient.age} yrs</td>
                                            <td>
                                                <span className={`badge ${patient.gender === 'MALE' ? 'badge-info' : 'badge-success'}`}>
                                                    {patient.gender === 'MALE' ? t('patient.male') : t('patient.female')}
                                                </span>
                                            </td>
                                            <td>
                                                {patient.measurements[0]?.weight || patient.weight} kg
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/dashboard/doctor/patients/${patient.id}`}
                                                    className="btn btn-sm btn-secondary"
                                                >
                                                    {t('common.view')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🧑</div>
                            <div className="empty-state-title">{t('patient.noPatients')}</div>
                            <div className="empty-state-desc">{t('common.noData')}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
