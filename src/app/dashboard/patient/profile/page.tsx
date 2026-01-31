'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import styles from './profile.module.css'

interface Patient {
    id: string
    fullName: string
    age: number
    gender: string
    height: number
    weight: number
    medicalConditions: string | null
    allergies: string | null
    currentMedications: string | null
    notes: string | null
    startDate: string
}

export default function ProfilePage() {
    const t = useTranslations()
    const { data: session } = useSession()

    const [patient, setPatient] = useState<Patient | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: 'MALE',
        height: '',
        weight: '',
        medicalConditions: '',
        allergies: '',
        currentMedications: '',
        notes: '',
    })
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        fetchPatient()
    }, [session])

    const fetchPatient = async () => {
        try {
            const response = await fetch('/api/patients')
            const data = await response.json()

            if (data.success && data.data.length > 0) {
                const p = data.data[0]
                setPatient(p)
                setFormData({
                    fullName: p.fullName || '',
                    age: p.age?.toString() || '',
                    gender: p.gender || 'MALE',
                    height: p.height?.toString() || '',
                    weight: p.weight?.toString() || '',
                    medicalConditions: p.medicalConditions || '',
                    allergies: p.allergies || '',
                    currentMedications: p.currentMedications || '',
                    notes: p.notes || '',
                })
            }
        } catch (error) {
            console.error('Error fetching patient:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!patient) return

        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const response = await fetch(`/api/patients/${patient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: t('common.success') })
                setIsEditing(false)
                fetchPatient()
            } else {
                setMessage({ type: 'error', text: data.error })
            }
        } catch {
            setMessage({ type: 'error', text: t('errors.serverError') })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="spinner spinner-lg"></div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <div className="page-header flex justify-between items-start">
                <div>
                    <h1 className="page-title">{t('patient.title')}</h1>
                    <p className="page-subtitle">{t('common.profile')}</p>
                </div>
                {!isEditing && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsEditing(true)}
                    >
                        ✏️ {t('common.edit')}
                    </button>
                )}
            </div>

            {message.text && (
                <div className={`alert alert-${message.type} mb-6`}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label htmlFor="fullName" className="form-label">
                                    {t('patient.fullName')} *
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={!isEditing}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="age" className="form-label">
                                    {t('patient.age')} *
                                </label>
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={!isEditing}
                                    required
                                    min={1}
                                    max={120}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender" className="form-label">
                                    {t('patient.gender')} *
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="form-select"
                                    disabled={!isEditing}
                                    required
                                >
                                    <option value="MALE">{t('patient.male')}</option>
                                    <option value="FEMALE">{t('patient.female')}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="height" className="form-label">
                                    {t('patient.height')} *
                                </label>
                                <input
                                    id="height"
                                    name="height"
                                    type="number"
                                    step="0.1"
                                    value={formData.height}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={!isEditing}
                                    required
                                    min={50}
                                    max={250}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="weight" className="form-label">
                                    {t('patient.weight')} *
                                </label>
                                <input
                                    id="weight"
                                    name="weight"
                                    type="number"
                                    step="0.1"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={!isEditing}
                                    required
                                    min={20}
                                    max={300}
                                />
                            </div>
                        </div>

                        <hr className={styles.divider} />

                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label htmlFor="medicalConditions" className="form-label">
                                    {t('patient.medicalConditions')}
                                </label>
                                <textarea
                                    id="medicalConditions"
                                    name="medicalConditions"
                                    value={formData.medicalConditions}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    disabled={!isEditing}
                                    rows={3}
                                    placeholder="Diabetes, Hypertension, etc."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="allergies" className="form-label">
                                    {t('patient.allergies')}
                                </label>
                                <textarea
                                    id="allergies"
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    disabled={!isEditing}
                                    rows={3}
                                    placeholder="Nuts, Shellfish, etc."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="currentMedications" className="form-label">
                                    {t('patient.currentMedications')}
                                </label>
                                <textarea
                                    id="currentMedications"
                                    name="currentMedications"
                                    value={formData.currentMedications}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    disabled={!isEditing}
                                    rows={3}
                                    placeholder="Metformin, Aspirin, etc."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes" className="form-label">
                                    {t('patient.notes')}
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    disabled={!isEditing}
                                    rows={3}
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? <span className="spinner" /> : t('common.save')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false)
                                        if (patient) {
                                            setFormData({
                                                fullName: patient.fullName || '',
                                                age: patient.age?.toString() || '',
                                                gender: patient.gender || 'MALE',
                                                height: patient.height?.toString() || '',
                                                weight: patient.weight?.toString() || '',
                                                medicalConditions: patient.medicalConditions || '',
                                                allergies: patient.allergies || '',
                                                currentMedications: patient.currentMedications || '',
                                                notes: patient.notes || '',
                                            })
                                        }
                                    }}
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
