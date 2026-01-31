import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { calculateBMI, getBMICategory } from '@/lib/utils'
import styles from './patient.module.css'

export default async function PatientDashboard() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PATIENT') {
        redirect('/dashboard')
    }

    const t = await getTranslations()
    const locale = session.user.language || 'en'

    // Get patient data
    const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id },
        include: {
            doctor: {
                select: { name: true, email: true },
            },
            measurements: {
                orderBy: { createdAt: 'desc' },
            },
            images: {
                orderBy: { uploadedAt: 'desc' },
                take: 6,
            },
            nutritionPlan: true,
            medicines: {
                include: { medicine: true },
                where: { confirmed: false },
            },
        },
    })

    if (!patient) {
        return (
            <div className={styles.page}>
                <div className="alert alert-warning">
                    Patient profile not found. Please contact support.
                </div>
            </div>
        )
    }

    const bmi = calculateBMI(patient.weight, patient.height)
    const bmiCategory = getBMICategory(bmi, locale)

    // Calculate measurement progress
    const day1Measurement = patient.measurements.find(m => m.dayType === 'DAY_1')
    const latestMeasurement = patient.measurements[0]
    const weightChange = latestMeasurement && day1Measurement
        ? (latestMeasurement.weight || 0) - (day1Measurement.weight || 0)
        : 0

    // Determine which measurements are pending
    const hasDays = {
        DAY_1: patient.measurements.some(m => m.dayType === 'DAY_1'),
        DAY_15: patient.measurements.some(m => m.dayType === 'DAY_15'),
        DAY_30: patient.measurements.some(m => m.dayType === 'DAY_30'),
    }

    return (
        <div className={styles.page}>
            <div className="page-header">
                <h1 className="page-title">{t('nav.dashboard')}</h1>
                <p className="page-subtitle">{t('dashboard.welcomeBack')}, {patient.fullName}</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className="stat-card">
                    <div className="stat-card-icon primary">⚖️</div>
                    <div className="stat-card-value">{latestMeasurement?.weight || patient.weight} kg</div>
                    <div className="stat-card-label">{t('measurements.weight')}</div>
                    {weightChange !== 0 && (
                        <div className={`${styles.change} ${weightChange < 0 ? styles.positive : styles.negative}`}>
                            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                        </div>
                    )}
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon info">📊</div>
                    <div className="stat-card-value">{bmi}</div>
                    <div className="stat-card-label">{t('patient.bmi')}</div>
                    <div className={styles.change}>{bmiCategory}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon success">📸</div>
                    <div className="stat-card-value">{patient.images.length}</div>
                    <div className="stat-card-label">{t('images.title')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon warning">💊</div>
                    <div className="stat-card-value">{patient.medicines.length}</div>
                    <div className="stat-card-label">{t('medicines.pending')}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={`card ${styles.quickActions}`}>
                <div className="card-header">
                    <h2 className="card-title">{t('dashboard.quickActions')}</h2>
                </div>
                <div className="card-body">
                    <div className={styles.actionButtons}>
                        <Link href="/dashboard/patient/measurements" className="btn btn-primary">
                            📏 {t('measurements.addMeasurement')}
                        </Link>
                        <Link href="/dashboard/patient/images" className="btn btn-secondary">
                            📸 {t('images.uploadImage')}
                        </Link>
                        <Link href="/dashboard/patient/nutrition-plan" className="btn btn-secondary">
                            🥗 {t('nav.myPlan')}
                        </Link>
                        <Link href="/dashboard/patient/progress" className="btn btn-secondary">
                            📈 {t('nav.progress')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Measurement Progress */}
            <div className="grid grid-2 gap-6 mt-6">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">{t('dashboard.upcomingMeasurements')}</h2>
                    </div>
                    <div className="card-body">
                        <div className={styles.measurementDays}>
                            <div className={`${styles.dayCard} ${hasDays.DAY_1 ? styles.completed : ''}`}>
                                <span className={styles.dayIcon}>{hasDays.DAY_1 ? '✅' : '📅'}</span>
                                <span className={styles.dayLabel}>{t('measurements.day1')}</span>
                                {hasDays.DAY_1 ? (
                                    <span className="badge badge-success">{t('common.success')}</span>
                                ) : (
                                    <Link href="/dashboard/patient/measurements?day=DAY_1" className="btn btn-sm btn-primary">
                                        {t('common.add')}
                                    </Link>
                                )}
                            </div>
                            <div className={`${styles.dayCard} ${hasDays.DAY_15 ? styles.completed : ''}`}>
                                <span className={styles.dayIcon}>{hasDays.DAY_15 ? '✅' : '📅'}</span>
                                <span className={styles.dayLabel}>{t('measurements.day15')}</span>
                                {hasDays.DAY_15 ? (
                                    <span className="badge badge-success">{t('common.success')}</span>
                                ) : (
                                    <Link href="/dashboard/patient/measurements?day=DAY_15" className="btn btn-sm btn-primary">
                                        {t('common.add')}
                                    </Link>
                                )}
                            </div>
                            <div className={`${styles.dayCard} ${hasDays.DAY_30 ? styles.completed : ''}`}>
                                <span className={styles.dayIcon}>{hasDays.DAY_30 ? '✅' : '📅'}</span>
                                <span className={styles.dayLabel}>{t('measurements.day30')}</span>
                                {hasDays.DAY_30 ? (
                                    <span className="badge badge-success">{t('common.success')}</span>
                                ) : (
                                    <Link href="/dashboard/patient/measurements?day=DAY_30" className="btn btn-sm btn-primary">
                                        {t('common.add')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assigned Doctor */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">{t('patient.assignedDoctor')}</h2>
                    </div>
                    <div className="card-body">
                        {patient.doctor ? (
                            <div className={styles.doctorCard}>
                                <div className="avatar avatar-lg">👨‍⚕️</div>
                                <div className={styles.doctorInfo}>
                                    <div className={styles.doctorName}>{patient.doctor.name}</div>
                                    <div className={styles.doctorEmail}>{patient.doctor.email}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">👨‍⚕️</div>
                                <div className="empty-state-title">{t('common.noData')}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nutrition Plan Preview */}
            {patient.nutritionPlan && (
                <div className="card mt-6">
                    <div className="card-header flex justify-between items-center">
                        <h2 className="card-title">{t('nutrition.title')}</h2>
                        <Link href="/dashboard/patient/nutrition-plan" className="btn btn-sm btn-outline">
                            {t('common.view')} →
                        </Link>
                    </div>
                    <div className="card-body">
                        <div className={styles.planPreview}>
                            <h3 className={styles.planTitle}>{patient.nutritionPlan.title}</h3>
                            <div className={styles.macros}>
                                <div className={styles.macro}>
                                    <span className={styles.macroValue}>{patient.nutritionPlan.totalCalories}</span>
                                    <span className={styles.macroLabel}>{t('nutrition.calories')}</span>
                                </div>
                                <div className={styles.macro}>
                                    <span className={styles.macroValue}>{patient.nutritionPlan.proteinGrams}g</span>
                                    <span className={styles.macroLabel}>{t('nutrition.protein')}</span>
                                </div>
                                <div className={styles.macro}>
                                    <span className={styles.macroValue}>{patient.nutritionPlan.carbsGrams}g</span>
                                    <span className={styles.macroLabel}>{t('nutrition.carbs')}</span>
                                </div>
                                <div className={styles.macro}>
                                    <span className={styles.macroValue}>{patient.nutritionPlan.fatsGrams}g</span>
                                    <span className={styles.macroLabel}>{t('nutrition.fats')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
