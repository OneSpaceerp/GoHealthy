'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import styles from './new-plan.module.css'

interface Patient {
    id: string
    fullName: string
}

interface Meal {
    name: string
    time: string
    description: string
    calories: number
    protein: number
    carbs: number
    fats: number
}

export default function NewNutritionPlanPage() {
    const t = useTranslations()
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedPatientId = searchParams.get('patientId')
    const { data: session } = useSession()

    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        totalCalories: '',
        proteinGrams: '',
        carbsGrams: '',
        fatsGrams: '',
        allowedFoods: '',
        restrictedFoods: '',
        supplements: '',
        patientId: preselectedPatientId || '',
        startDate: '',
        endDate: '',
    })
    const [meals, setMeals] = useState<Meal[]>([])
    const [newMeal, setNewMeal] = useState<Meal>({
        name: '',
        time: '',
        description: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
    })

    useEffect(() => {
        fetchPatients()
    }, [session])

    const fetchPatients = async () => {
        try {
            const response = await fetch('/api/patients')
            const data = await response.json()
            if (data.success) {
                setPatients(data.data)
            }
        } catch (error) {
            console.error('Error fetching patients:', error)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleMealChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewMeal({
            ...newMeal,
            [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
        })
    }

    const addMeal = () => {
        if (newMeal.name && newMeal.time) {
            setMeals([...meals, newMeal])
            setNewMeal({
                name: '',
                time: '',
                description: '',
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
            })
        }
    }

    const removeMeal = (index: number) => {
        setMeals(meals.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const response = await fetch('/api/nutrition-plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    meals,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: t('common.success') })
                setTimeout(() => {
                    router.push('/dashboard/doctor/nutrition-plans')
                }, 1500)
            } else {
                setMessage({ type: 'error', text: data.error })
            }
        } catch {
            setMessage({ type: 'error', text: t('errors.serverError') })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className="page-header">
                <h1 className="page-title">{t('nutrition.createPlan')}</h1>
                <p className="page-subtitle">{t('nutrition.description')}</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type} mb-6`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="card mb-6">
                    <div className="card-header">
                        <h2 className="card-title">Basic Information</h2>
                    </div>
                    <div className="card-body">
                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label htmlFor="title" className="form-label">{t('nutrition.planTitle')} *</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    placeholder="Weight Loss Plan"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="patientId" className="form-label">{t('nutrition.assignTo')}</label>
                                <select
                                    id="patientId"
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="">{t('nutrition.selectPatient')}</option>
                                    {patients.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="startDate" className="form-label">{t('nutrition.startDate')}</label>
                                <input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endDate" className="form-label">{t('nutrition.endDate')}</label>
                                <input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <label htmlFor="description" className="form-label">{t('nutrition.description')}</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea"
                                rows={3}
                                placeholder="Plan description and goals..."
                            />
                        </div>
                    </div>
                </div>

                {/* Macros */}
                <div className="card mb-6">
                    <div className="card-header">
                        <h2 className="card-title">{t('nutrition.macros')}</h2>
                    </div>
                    <div className="card-body">
                        <div className={styles.macrosGrid}>
                            <div className="form-group">
                                <label htmlFor="totalCalories" className="form-label">{t('nutrition.calories')} *</label>
                                <input
                                    id="totalCalories"
                                    name="totalCalories"
                                    type="number"
                                    value={formData.totalCalories}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    min={0}
                                    placeholder="2000"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="proteinGrams" className="form-label">{t('nutrition.protein')} (g) *</label>
                                <input
                                    id="proteinGrams"
                                    name="proteinGrams"
                                    type="number"
                                    value={formData.proteinGrams}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    min={0}
                                    placeholder="150"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="carbsGrams" className="form-label">{t('nutrition.carbs')} (g) *</label>
                                <input
                                    id="carbsGrams"
                                    name="carbsGrams"
                                    type="number"
                                    value={formData.carbsGrams}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    min={0}
                                    placeholder="200"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fatsGrams" className="form-label">{t('nutrition.fats')} (g) *</label>
                                <input
                                    id="fatsGrams"
                                    name="fatsGrams"
                                    type="number"
                                    value={formData.fatsGrams}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    min={0}
                                    placeholder="60"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meals */}
                <div className="card mb-6">
                    <div className="card-header">
                        <h2 className="card-title">{t('nutrition.meals')}</h2>
                    </div>
                    <div className="card-body">
                        {meals.length > 0 && (
                            <div className={styles.mealsList}>
                                {meals.map((meal, index) => (
                                    <div key={index} className={styles.mealItem}>
                                        <div className={styles.mealInfo}>
                                            <strong>{meal.time} - {meal.name}</strong>
                                            <span>{meal.description}</span>
                                            <span className={styles.mealMacros}>
                                                {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline"
                                            onClick={() => removeMeal(index)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.addMealForm}>
                            <h4>Add Meal</h4>
                            <div className={styles.formGrid}>
                                <div className="form-group">
                                    <label className="form-label">{t('nutrition.mealName')}</label>
                                    <input
                                        name="name"
                                        type="text"
                                        value={newMeal.name}
                                        onChange={handleMealChange}
                                        className="form-input"
                                        placeholder="Breakfast"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('nutrition.mealTime')}</label>
                                    <input
                                        name="time"
                                        type="time"
                                        value={newMeal.time}
                                        onChange={handleMealChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('nutrition.description')}</label>
                                <textarea
                                    name="description"
                                    value={newMeal.description}
                                    onChange={handleMealChange}
                                    className="form-textarea"
                                    rows={2}
                                    placeholder="Oatmeal with fruits and nuts..."
                                />
                            </div>
                            <div className={styles.macrosGrid}>
                                <div className="form-group">
                                    <label className="form-label">{t('nutrition.calories')}</label>
                                    <input
                                        name="calories"
                                        type="number"
                                        value={newMeal.calories}
                                        onChange={handleMealChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('nutrition.protein')}</label>
                                    <input
                                        name="protein"
                                        type="number"
                                        value={newMeal.protein}
                                        onChange={handleMealChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('nutrition.carbs')}</label>
                                    <input
                                        name="carbs"
                                        type="number"
                                        value={newMeal.carbs}
                                        onChange={handleMealChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('nutrition.fats')}</label>
                                    <input
                                        name="fats"
                                        type="number"
                                        value={newMeal.fats}
                                        onChange={handleMealChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary mt-2"
                                onClick={addMeal}
                            >
                                + Add Meal
                            </button>
                        </div>
                    </div>
                </div>

                {/* Foods Lists */}
                <div className="card mb-6">
                    <div className="card-header">
                        <h2 className="card-title">Food Lists & Supplements</h2>
                    </div>
                    <div className="card-body">
                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label htmlFor="allowedFoods" className="form-label">{t('nutrition.allowedFoods')}</label>
                                <textarea
                                    id="allowedFoods"
                                    name="allowedFoods"
                                    value={formData.allowedFoods}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="Chicken, Fish, Vegetables..."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="restrictedFoods" className="form-label">{t('nutrition.restrictedFoods')}</label>
                                <textarea
                                    id="restrictedFoods"
                                    name="restrictedFoods"
                                    value={formData.restrictedFoods}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="Sugar, Fried foods, Soda..."
                                />
                            </div>
                        </div>
                        <div className="form-group mt-4">
                            <label htmlFor="supplements" className="form-label">{t('nutrition.supplements')}</label>
                            <textarea
                                id="supplements"
                                name="supplements"
                                value={formData.supplements}
                                onChange={handleChange}
                                className="form-textarea"
                                rows={3}
                                placeholder="Vitamin D, Omega 3, Multivitamins..."
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : t('nutrition.createPlan')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => router.back()}
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </form>
        </div>
    )
}
