import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import styles from './patients.module.css'

export default async function DoctorPatientsPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'DOCTOR') {
        redirect('/dashboard')
    }

    const t = await getTranslations()

    const patients = await prisma.patient.findMany({
        where: { doctorId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { email: true },
            },
            measurements: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
            nutritionPlan: {
                select: { id: true, title: true },
            },
        },
    })

    return (
        <div className={styles.page}>
            <div className="page-header">
                <h1 className="page-title">{t('nav.patients')}</h1>
                <p className="page-subtitle">{t('patient.patientList')}</p>
            </div>

            {patients.length > 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t('patient.fullName')}</th>
                                        <th>{t('common.email')}</th>
                                        <th>{t('patient.age')}</th>
                                        <th>{t('patient.gender')}</th>
                                        <th>{t('measurements.weight')}</th>
                                        <th>{t('nutrition.title')}</th>
                                        <th>{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((patient) => (
                                        <tr key={patient.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-sm">
                                                        {patient.fullName.charAt(0)}
                                                    </div>
                                                    <span className="font-medium">{patient.fullName}</span>
                                                </div>
                                            </td>
                                            <td>{patient.user.email}</td>
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
                                                {patient.nutritionPlan ? (
                                                    <span className="badge badge-success">{patient.nutritionPlan.title}</span>
                                                ) : (
                                                    <span className="badge badge-warning">{t('nutrition.noPlan')}</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/doctor/patients/${patient.id}`}
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        {t('common.view')}
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/doctor/patients/${patient.id}/progress`}
                                                        className="btn btn-sm btn-secondary"
                                                    >
                                                        📈
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">🧑</div>
                    <div className="empty-state-title">{t('patient.noPatients')}</div>
                    <div className="empty-state-desc">{t('common.noData')}</div>
                </div>
            )}
        </div>
    )
}
