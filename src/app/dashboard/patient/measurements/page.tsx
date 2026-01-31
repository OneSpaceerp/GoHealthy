'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import styles from './measurements.module.css'

interface Measurement {
    id: string
    dayType: string
    weight: number | null
    armCircumference: number | null
    waistOnNavel: number | null
    waistAboveNavel: number | null
    hipCircumference: number | null
    thighCircumference: number | null
    notes: string | null
    measuredAt: string
}

export default function MeasurementsPage() {
    const t = useTranslations()
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const preselectedDay = searchParams.get('day')

    const [measurements, setMeasurements] = useState<Measurement[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState(preselectedDay || 'DAY_1')
    const [patientId, setPatientId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        weight: '',
        armCircumference: '',
        waistOnNavel: '',
        waistAboveNavel: '',
        hipCircumference: '',
        thighCircumference: '',
        notes: '',
    })
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        fetchPatientAndMeasurements()
    }, [session])

    useEffect(() => {
        // Load existing measurement data for selected day
        const existing = measurements.find(m => m.dayType === activeTab)
        if (existing) {
            setFormData({
                weight: existing.weight?.toString() || '',
                armCircumference: existing.armCircumference?.toString() || '',
                waistOnNavel: existing.waistOnNavel?.toString() || '',
                waistAboveNavel: existing.waistAboveNavel?.toString() || '',
                hipCircumference: existing.hipCircumference?.toString() || '',
                thighCircumference: existing.thighCircumference?.toString() || '',
                notes: existing.notes || '',
            })
        } else {
            setFormData({
                weight: '',
                armCircumference: '',
                waistOnNavel: '',
                waistAboveNavel: '',
                hipCircumference: '',
                thighCircumference: '',
                notes: '',
            })
        }
    }, [activeTab, measurements])

    const fetchPatientAndMeasurements = async () => {
        try {
            // First get patient ID
            const patientRes = await fetch('/api/patients')
            const patientData = await patientRes.json()

            if (patientData.success && patientData.data.length > 0) {
                const patient = patientData.data[0]
                setPatientId(patient.id)

                // Then get measurements
                const measurementsRes = await fetch(`/api/patients/${patient.id}/measurements`)
                const measurementsData = await measurementsRes.json()

                if (measurementsData.success) {
                    setMeasurements(measurementsData.data)
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!patientId) return

        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const response = await fetch(`/api/patients/${patientId}/measurements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dayType: activeTab,
                    ...formData,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: t('common.success') })
                fetchPatientAndMeasurements()
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
            <div className="page-header">
                <h1 className="page-title">{t('measurements.title')}</h1>
                <p className="page-subtitle">{t('measurements.instructionsText')}</p>
            </div>

            {/* Instructions Alert */}
            <div className="alert alert-info mb-6">
                <strong>{t('measurements.measurementInstructions')}:</strong> {t('measurements.instructionsText')}
            </div>

            {/* Day Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'DAY_1' ? 'active' : ''}`}
                    onClick={() => setActiveTab('DAY_1')}
                >
                    {t('measurements.day1')}
                    {measurements.find(m => m.dayType === 'DAY_1') && ' ✓'}
                </button>
                <button
                    className={`tab ${activeTab === 'DAY_15' ? 'active' : ''}`}
                    onClick={() => setActiveTab('DAY_15')}
                >
                    {t('measurements.day15')}
                    {measurements.find(m => m.dayType === 'DAY_15') && ' ✓'}
                </button>
                <button
                    className={`tab ${activeTab === 'DAY_30' ? 'active' : ''}`}
                    onClick={() => setActiveTab('DAY_30')}
                >
                    {t('measurements.day30')}
                    {measurements.find(m => m.dayType === 'DAY_30') && ' ✓'}
                </button>
            </div>

            {/* Measurement Form */}
            <div className="card">
                <div className="card-body">
                    {message.text && (
                        <div className={`alert alert-${message.type} mb-4`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label htmlFor="weight" className="form-label">
                                    {t('measurements.weight')} ({t('measurements.weightUnit')})
                                </label>
                                <input
                                    id="weight"
                                    name="weight"
                                    type="number"
                                    step="0.1"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="75.5"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="armCircumference" className="form-label">
                                    {t('measurements.armCircumference')} ({t('measurements.unit')})
                                </label>
                                <input
                                    id="armCircumference"
                                    name="armCircumference"
                                    type="number"
                                    step="0.1"
                                    value={formData.armCircumference}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="32.0"
                                />
                                <span className="form-hint">{t('measurements.armCircumferenceNote')}</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="waistOnNavel" className="form-label">
                                    {t('measurements.waistOnNavel')} ({t('measurements.unit')})
                                </label>
                                <input
                                    id="waistOnNavel"
                                    name="waistOnNavel"
                                    type="number"
                                    step="0.1"
                                    value={formData.waistOnNavel}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="85.0"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="waistAboveNavel" className="form-label">
                                    {t('measurements.waistAboveNavel')} ({t('measurements.unit')})
                                </label>
                                <input
                                    id="waistAboveNavel"
                                    name="waistAboveNavel"
                                    type="number"
                                    step="0.1"
                                    value={formData.waistAboveNavel}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="80.0"
                                />
                                <span className="form-hint">{t('measurements.waistAboveNavelNote')}</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="hipCircumference" className="form-label">
                                    {t('measurements.hipCircumference')} ({t('measurements.unit')})
                                </label>
                                <input
                                    id="hipCircumference"
                                    name="hipCircumference"
                                    type="number"
                                    step="0.1"
                                    value={formData.hipCircumference}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="95.0"
                                />
                                <span className="form-hint">{t('measurements.hipCircumferenceNote')}</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="thighCircumference" className="form-label">
                                    {t('measurements.thighCircumference')} ({t('measurements.unit')})
                                </label>
                                <input
                                    id="thighCircumference"
                                    name="thighCircumference"
                                    type="number"
                                    step="0.1"
                                    value={formData.thighCircumference}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="55.0"
                                />
                                <span className="form-hint">{t('measurements.thighCircumferenceNote')}</span>
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <label htmlFor="notes" className="form-label">
                                {t('common.notes')}
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder={t('common.notes')}
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? <span className="spinner" /> : t('common.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Measurements History */}
            {measurements.length > 0 && (
                <div className="card mt-6">
                    <div className="card-header">
                        <h2 className="card-title">{t('dashboard.measurementProgress')}</h2>
                    </div>
                    <div className="card-body">
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t('measurements.selectDay')}</th>
                                        <th>{t('measurements.weight')}</th>
                                        <th>{t('measurements.armCircumference')}</th>
                                        <th>{t('measurements.waistOnNavel')}</th>
                                        <th>{t('measurements.hipCircumference')}</th>
                                        <th>{t('measurements.thighCircumference')}</th>
                                        <th>{t('common.date')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {measurements.map((m) => (
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
                    </div>
                </div>
            )}
        </div>
    )
}
