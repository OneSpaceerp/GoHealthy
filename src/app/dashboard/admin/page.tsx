import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import styles from './admin.module.css'

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const t = await getTranslations()

    // Get statistics
    const [totalUsers, totalDoctors, totalPatients, activePlans] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'DOCTOR' } }),
        prisma.patient.count(),
        prisma.nutritionPlan.count({ where: { isActive: true } }),
    ])

    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    })

    return (
        <div className={styles.page}>
            <div className="page-header">
                <h1 className="page-title">{t('admin.title')}</h1>
                <p className="page-subtitle">{t('dashboard.welcomeBack')}, {session.user.name}</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className="stat-card">
                    <div className="stat-card-icon primary">👥</div>
                    <div className="stat-card-value">{totalUsers}</div>
                    <div className="stat-card-label">{t('admin.totalUsers')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon info">👨‍⚕️</div>
                    <div className="stat-card-value">{totalDoctors}</div>
                    <div className="stat-card-label">{t('dashboard.totalDoctors')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon success">🧑</div>
                    <div className="stat-card-value">{totalPatients}</div>
                    <div className="stat-card-label">{t('dashboard.totalPatients')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon warning">🥗</div>
                    <div className="stat-card-value">{activePlans}</div>
                    <div className="stat-card-label">{t('dashboard.activePlans')}</div>
                </div>
            </div>

            {/* Recent Users */}
            <div className="card mt-8">
                <div className="card-header">
                    <h2 className="card-title">{t('dashboard.recentActivity')}</h2>
                </div>
                <div className="card-body">
                    {recentUsers.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t('common.name')}</th>
                                        <th>{t('common.email')}</th>
                                        <th>{t('admin.userRole')}</th>
                                        <th>{t('common.date')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge badge-${user.role === 'DOCTOR' ? 'info' : user.role === 'ADMIN' ? 'warning' : 'success'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <div className="empty-state-title">{t('common.noData')}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
