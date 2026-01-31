import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import styles from './plans.module.css'

interface NutritionPlanWithPatient {
    id: string
    title: string
    description: string | null
    totalCalories: number
    proteinGrams: number
    carbsGrams: number
    fatsGrams: number
    isActive: boolean
    createdAt: Date
    patient: { fullName: string } | null
}

export default async function DoctorNutritionPlansPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'DOCTOR') {
        redirect('/dashboard')
    }

    const t = await getTranslations()

    const plans = await prisma.nutritionPlan.findMany({
        where: { doctorId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            patient: {
                select: { fullName: true },
            },
        },
    })

    return (
        <div className={styles.page}>
            <div className="page-header flex justify-between items-start">
                <div>
                    <h1 className="page-title">{t('nav.nutritionPlans')}</h1>
                    <p className="page-subtitle">{t('nutrition.description')}</p>
                </div>
                <Link href="/dashboard/doctor/nutrition-plans/new" className="btn btn-primary">
                    + {t('nutrition.createPlan')}
                </Link>
            </div>

            {plans.length > 0 ? (
                <div className={styles.plansGrid}>
                    {(plans as NutritionPlanWithPatient[]).map((plan) => (
                        <div key={plan.id} className="card">
                            <div className="card-body">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className={styles.planTitle}>{plan.title}</h3>
                                    <span className={`badge ${plan.isActive ? 'badge-success' : 'badge-warning'}`}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <p className={styles.planDesc}>{plan.description || 'No description'}</p>

                                <div className={styles.planMacros}>
                                    <span>🔥 {plan.totalCalories} cal</span>
                                    <span>🥩 {plan.proteinGrams}g</span>
                                    <span>🍞 {plan.carbsGrams}g</span>
                                    <span>🥑 {plan.fatsGrams}g</span>
                                </div>

                                <div className={styles.planMeta}>
                                    {plan.patient ? (
                                        <span className="badge badge-info">{plan.patient.fullName}</span>
                                    ) : (
                                        <span className="badge badge-secondary">{t('nutrition.unassigned')}</span>
                                    )}
                                    <span className={styles.planDate}>
                                        {new Date(plan.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">🥗</div>
                    <div className="empty-state-title">{t('nutrition.noPlan')}</div>
                    <div className="empty-state-desc">{t('common.noData')}</div>
                    <Link href="/dashboard/doctor/nutrition-plans/new" className="btn btn-primary mt-4">
                        {t('nutrition.createPlan')}
                    </Link>
                </div>
            )}
        </div>
    )
}
