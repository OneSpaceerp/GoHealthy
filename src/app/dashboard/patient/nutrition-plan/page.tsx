import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import styles from './nutrition-plan.module.css'

interface Meal {
    name: string
    time: string
    description: string
    calories: number
    protein: number
    carbs: number
    fats: number
}

export default async function PatientNutritionPlanPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PATIENT') {
        redirect('/dashboard')
    }

    const t = await getTranslations()

    const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id },
        include: {
            nutritionPlan: {
                include: {
                    doctor: {
                        select: { name: true },
                    },
                },
            },
        },
    })

    const plan = patient?.nutritionPlan

    if (!plan) {
        return (
            <div className={styles.page}>
                <div className="page-header">
                    <h1 className="page-title">{t('nutrition.title')}</h1>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">🥗</div>
                    <div className="empty-state-title">{t('nutrition.noPlan')}</div>
                    <div className="empty-state-desc">
                        {t('common.noData')}
                    </div>
                </div>
            </div>
        )
    }

    const meals = plan.meals as unknown as Meal[]

    return (
        <div className={styles.page}>
            <div className="page-header">
                <h1 className="page-title">{plan.title}</h1>
                <p className="page-subtitle">
                    {t('patient.assignedDoctor')}: {plan.doctor.name}
                </p>
            </div>

            {/* Macros Overview */}
            <div className={styles.macrosCard}>
                <h2 className={styles.macrosTitle}>{t('nutrition.macros')}</h2>
                <div className={styles.macrosGrid}>
                    <div className={styles.macroItem}>
                        <div className={styles.macroCircle} style={{ '--color': '#4CAF50' } as React.CSSProperties}>
                            {plan.totalCalories}
                        </div>
                        <span className={styles.macroLabel}>{t('nutrition.calories')}</span>
                    </div>
                    <div className={styles.macroItem}>
                        <div className={styles.macroCircle} style={{ '--color': '#2196F3' } as React.CSSProperties}>
                            {plan.proteinGrams}g
                        </div>
                        <span className={styles.macroLabel}>{t('nutrition.protein')}</span>
                    </div>
                    <div className={styles.macroItem}>
                        <div className={styles.macroCircle} style={{ '--color': '#FF9800' } as React.CSSProperties}>
                            {plan.carbsGrams}g
                        </div>
                        <span className={styles.macroLabel}>{t('nutrition.carbs')}</span>
                    </div>
                    <div className={styles.macroItem}>
                        <div className={styles.macroCircle} style={{ '--color': '#E91E63' } as React.CSSProperties}>
                            {plan.fatsGrams}g
                        </div>
                        <span className={styles.macroLabel}>{t('nutrition.fats')}</span>
                    </div>
                </div>
            </div>

            {/* Description */}
            {plan.description && (
                <div className="card mb-6">
                    <div className="card-header">
                        <h2 className="card-title">{t('nutrition.description')}</h2>
                    </div>
                    <div className="card-body">
                        <p>{plan.description}</p>
                    </div>
                </div>
            )}

            {/* Meals */}
            {meals && meals.length > 0 && (
                <div className="card mb-6">
                    <div className="card-header">
                        <h2 className="card-title">{t('nutrition.meals')}</h2>
                    </div>
                    <div className="card-body">
                        <div className={styles.mealsGrid}>
                            {meals.map((meal, index) => (
                                <div key={index} className={styles.mealCard}>
                                    <div className={styles.mealHeader}>
                                        <span className={styles.mealTime}>{meal.time}</span>
                                        <h3 className={styles.mealName}>{meal.name}</h3>
                                    </div>
                                    <p className={styles.mealDesc}>{meal.description}</p>
                                    <div className={styles.mealMacros}>
                                        <span>{meal.calories} cal</span>
                                        <span>P: {meal.protein}g</span>
                                        <span>C: {meal.carbs}g</span>
                                        <span>F: {meal.fats}g</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Foods Lists */}
            <div className="grid grid-2 gap-6">
                {plan.allowedFoods && (
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">✅ {t('nutrition.allowedFoods')}</h2>
                        </div>
                        <div className="card-body">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{plan.allowedFoods}</p>
                        </div>
                    </div>
                )}

                {plan.restrictedFoods && (
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">🚫 {t('nutrition.restrictedFoods')}</h2>
                        </div>
                        <div className="card-body">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{plan.restrictedFoods}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Supplements */}
            {plan.supplements && (
                <div className="card mt-6">
                    <div className="card-header">
                        <h2 className="card-title">💊 {t('nutrition.supplements')}</h2>
                    </div>
                    <div className="card-body">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{plan.supplements}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
