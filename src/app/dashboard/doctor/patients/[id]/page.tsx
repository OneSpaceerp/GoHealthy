import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { calculateBMI, getBMICategory } from '@/lib/utils'
import styles from './patient-detail.module.css'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function PatientDetailPage({ params }: PageProps) {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== 'DOCTOR') {
        redirect('/dashboard')
    }

    const t = await getTranslations()

    const patient = await prisma.patient.findUnique({
        where: { id, doctorId: session.user.id },
        include: {
            user: {
                select: { email: true },
            },
            measurements: {
                orderBy: { createdAt: 'desc' },
            },
            images: {
                orderBy: { uploadedAt: 'desc' },
                take: 9,
            },
            nutritionPlan: true,
            medicines: {
                include: { medicine: true },
            },
        },
    })

    if (!patient) {
        notFound()
    }

    const bmi = calculateBMI(patient.weight, patient.height)
    const bmiCategory = getBMICategory(bmi, 'en')

    return (
        <div className={styles.page}>
            <div className="page-header flex justify-between items-start">
                <div>
                    <Link href="/dashboard/doctor/patients" className="text-sm text-muted mb-2 inline-block">
                        ← {t('patient.patientList')}
                    </Link>
                    <h1 className="page-title">{patient.fullName}</h1>
                    <p className="page-subtitle">{patient.user.email}</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/dashboard/doctor/patients/${id}/progress`}
                        className="btn btn-secondary"
                    >
                        📈 {t('nav.progress')}
                    </Link>
                    <Link
                        href={`/dashboard/doctor/nutrition-plans/new?patientId=${id}`}
                        className="btn btn-primary"
                    >
                        🥗 {t('nutrition.assignPlan')}
                    </Link>
                </div>
            </div>

            {/* Patient Info */}
            <div className={styles.infoGrid}>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">{t('patient.basicInfo')}</h2>
                    </div>
                    <div className="card-body">
                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>{t('patient.age')}</span>
                                <span className={styles.infoValue}>{patient.age} years</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>{t('patient.gender')}</span>
                                <span className={styles.infoValue}>
                                    {patient.gender === 'MALE' ? t('patient.male') : t('patient.female')}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>{t('patient.height')}</span>
                                <span className={styles.infoValue}>{patient.height} cm</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>{t('patient.weight')}</span>
                                <span className={styles.infoValue}>{patient.weight} kg</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>{t('patient.bmi')}</span>
                                <span className={styles.infoValue}>{bmi} ({bmiCategory})</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">{t('patient.medicalInfo')}</h2>
                    </div>
                    <div className="card-body">
                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>{t('patient.medicalConditions')}</span>
                                <span className={styles.infoValue}>{patient.medicalConditions || '-'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>{t('patient.allergies')}</span>
                                <span className={styles.infoValue}>{patient.allergies || '-'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>{t('patient.currentMedications')}</span>
                                <span className={styles.infoValue}>{patient.currentMedications || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Measurements */}
            <div className="card mt-6">
                <div className="card-header">
                    <h2 className="card-title">{t('measurements.title')}</h2>
                </div>
                <div className="card-body">
                    {patient.measurements.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t('images.dayType')}</th>
                                        <th>{t('measurements.weight')}</th>
                                        <th>{t('measurements.armCircumference')}</th>
                                        <th>{t('measurements.waistOnNavel')}</th>
                                        <th>{t('measurements.hipCircumference')}</th>
                                        <th>{t('measurements.thighCircumference')}</th>
                                        <th>{t('common.date')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patient.measurements.map((m) => (
                                        <tr key={m.id}>
                                            <td>
                                                <span className="badge badge-success">
                                                    {m.dayType === 'DAY_1' ? t('measurements.day1') :
                                                        m.dayType === 'DAY_15' ? t('measurements.day15') :
                                                            t('measurements.day30')}
                                                </span>
                                            </td>
                                            <td>{m.weight} kg</td>
                                            <td>{m.armCircumference} cm</td>
                                            <td>{m.waistOnNavel} cm</td>
                                            <td>{m.hipCircumference} cm</td>
                                            <td>{m.thighCircumference} cm</td>
                                            <td>{new Date(m.measuredAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📏</div>
                            <div className="empty-state-title">{t('common.noData')}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Patient Images */}
            <div className="card mt-6">
                <div className="card-header">
                    <h2 className="card-title">{t('images.title')}</h2>
                </div>
                <div className="card-body">
                    {patient.images.length > 0 ? (
                        <div className={styles.imagesGrid}>
                            {patient.images.map((image) => (
                                <div key={image.id} className={styles.imageCard}>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={image.imagePath}
                                            alt={`${image.dayType} ${image.imageType}`}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className={styles.imageInfo}>
                                        <span className="badge badge-primary">{image.dayType.replace('_', ' ')}</span>
                                        <span className="badge badge-info">{image.imageType}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📸</div>
                            <div className="empty-state-title">{t('images.noImages')}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Assigned Nutrition Plan */}
            {patient.nutritionPlan && (
                <div className="card mt-6">
                    <div className="card-header">
                        <h2 className="card-title">{t('nutrition.title')}</h2>
                    </div>
                    <div className="card-body">
                        <h3>{patient.nutritionPlan.title}</h3>
                        <p className="text-muted">{patient.nutritionPlan.description}</p>
                        <div className="flex gap-6 mt-4">
                            <div><strong>{t('nutrition.calories')}:</strong> {patient.nutritionPlan.totalCalories}</div>
                            <div><strong>{t('nutrition.protein')}:</strong> {patient.nutritionPlan.proteinGrams}g</div>
                            <div><strong>{t('nutrition.carbs')}:</strong> {patient.nutritionPlan.carbsGrams}g</div>
                            <div><strong>{t('nutrition.fats')}:</strong> {patient.nutritionPlan.fatsGrams}g</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
