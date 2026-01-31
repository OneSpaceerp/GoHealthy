'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import styles from './progress.module.css'

interface Measurement {
    id: string
    dayType: string
    weight: number | null
    armCircumference: number | null
    waistOnNavel: number | null
    waistAboveNavel: number | null
    hipCircumference: number | null
    thighCircumference: number | null
    measuredAt: string
}

export default function ProgressPage() {
    const t = useTranslations()
    const { data: session } = useSession()

    const [measurements, setMeasurements] = useState<Measurement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMeasurements()
    }, [session])

    const fetchMeasurements = async () => {
        try {
            const patientRes = await fetch('/api/patients')
            const patientData = await patientRes.json()

            if (patientData.success && patientData.data.length > 0) {
                const patient = patientData.data[0]

                const measurementsRes = await fetch(`/api/patients/${patient.id}/measurements`)
                const measurementsData = await measurementsRes.json()

                if (measurementsData.success) {
                    // Sort by day type order
                    const sorted = measurementsData.data.sort((a: Measurement, b: Measurement) => {
                        const order = { DAY_1: 1, DAY_15: 2, DAY_30: 3 }
                        return order[a.dayType as keyof typeof order] - order[b.dayType as keyof typeof order]
                    })
                    setMeasurements(sorted)
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const chartData = measurements.map(m => ({
        name: m.dayType === 'DAY_1' ? t('measurements.day1') :
            m.dayType === 'DAY_15' ? t('measurements.day15') :
                t('measurements.day30'),
        weight: m.weight,
        arm: m.armCircumference,
        waist: m.waistOnNavel,
        hip: m.hipCircumference,
        thigh: m.thighCircumference,
    }))

    const calculateChange = (field: keyof Measurement) => {
        if (measurements.length < 2) return null
        const first = measurements.find(m => m.dayType === 'DAY_1')
        const last = measurements[measurements.length - 1]
        if (!first || !last) return null
        const firstVal = first[field] as number | null
        const lastVal = last[field] as number | null
        if (!firstVal || !lastVal) return null
        return (lastVal - firstVal).toFixed(1)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="spinner spinner-lg"></div>
            </div>
        )
    }

    if (measurements.length === 0) {
        return (
            <div className={styles.page}>
                <div className="page-header">
                    <h1 className="page-title">{t('nav.progress')}</h1>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">📈</div>
                    <div className="empty-state-title">{t('common.noData')}</div>
                    <div className="empty-state-desc">
                        Add measurements to see your progress
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <div className="page-header">
                <h1 className="page-title">{t('nav.progress')}</h1>
                <p className="page-subtitle">{t('dashboard.myProgress')}</p>
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <div className={`stat-card ${styles.summaryCard}`}>
                    <div className="stat-card-icon primary">⚖️</div>
                    <div className="stat-card-label">{t('measurements.weight')}</div>
                    {calculateChange('weight') && (
                        <div className={`${styles.change} ${parseFloat(calculateChange('weight')!) < 0 ? styles.positive : styles.negative}`}>
                            {parseFloat(calculateChange('weight')!) > 0 ? '+' : ''}{calculateChange('weight')} kg
                        </div>
                    )}
                </div>
                <div className={`stat-card ${styles.summaryCard}`}>
                    <div className="stat-card-icon info">💪</div>
                    <div className="stat-card-label">{t('measurements.armCircumference')}</div>
                    {calculateChange('armCircumference') && (
                        <div className={styles.change}>
                            {parseFloat(calculateChange('armCircumference')!) > 0 ? '+' : ''}{calculateChange('armCircumference')} cm
                        </div>
                    )}
                </div>
                <div className={`stat-card ${styles.summaryCard}`}>
                    <div className="stat-card-icon success">📏</div>
                    <div className="stat-card-label">{t('measurements.waistOnNavel')}</div>
                    {calculateChange('waistOnNavel') && (
                        <div className={`${styles.change} ${parseFloat(calculateChange('waistOnNavel')!) < 0 ? styles.positive : styles.negative}`}>
                            {parseFloat(calculateChange('waistOnNavel')!) > 0 ? '+' : ''}{calculateChange('waistOnNavel')} cm
                        </div>
                    )}
                </div>
                <div className={`stat-card ${styles.summaryCard}`}>
                    <div className="stat-card-icon warning">🦵</div>
                    <div className="stat-card-label">{t('measurements.thighCircumference')}</div>
                    {calculateChange('thighCircumference') && (
                        <div className={styles.change}>
                            {parseFloat(calculateChange('thighCircumference')!) > 0 ? '+' : ''}{calculateChange('thighCircumference')} cm
                        </div>
                    )}
                </div>
            </div>

            {/* Weight Chart */}
            <div className="card mb-6">
                <div className="card-header">
                    <h2 className="card-title">{t('dashboard.weightProgress')}</h2>
                </div>
                <div className="card-body">
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#4CAF50"
                                    strokeWidth={3}
                                    name={t('measurements.weight') + ' (kg)'}
                                    dot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Measurements Chart */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{t('dashboard.measurementProgress')}</h2>
                </div>
                <div className="card-body">
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="arm"
                                    stroke="#2196F3"
                                    strokeWidth={2}
                                    name={t('measurements.armCircumference') + ' (cm)'}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="waist"
                                    stroke="#FF9800"
                                    strokeWidth={2}
                                    name={t('measurements.waistOnNavel') + ' (cm)'}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="hip"
                                    stroke="#E91E63"
                                    strokeWidth={2}
                                    name={t('measurements.hipCircumference') + ' (cm)'}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="thigh"
                                    stroke="#9C27B0"
                                    strokeWidth={2}
                                    name={t('measurements.thighCircumference') + ' (cm)'}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="card mt-6">
                <div className="card-header">
                    <h2 className="card-title">{t('measurements.title')}</h2>
                </div>
                <div className="card-body">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>{t('images.dayType')}</th>
                                    <th>{t('measurements.weight')}</th>
                                    <th>{t('measurements.armCircumference')}</th>
                                    <th>{t('measurements.waistOnNavel')}</th>
                                    <th>{t('measurements.waistAboveNavel')}</th>
                                    <th>{t('measurements.hipCircumference')}</th>
                                    <th>{t('measurements.thighCircumference')}</th>
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
                                        <td>{m.waistAboveNavel} cm</td>
                                        <td>{m.hipCircumference} cm</td>
                                        <td>{m.thighCircumference} cm</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
