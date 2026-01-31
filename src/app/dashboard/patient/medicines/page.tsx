'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import styles from './medicines.module.css'

interface PatientMedicine {
    id: string
    dosage: string
    frequency: string
    durationDays: number
    notes: string | null
    confirmed: boolean
    startDate: string
    medicine: {
        id: string
        name: string
        description: string | null
    }
}

export default function PatientMedicinesPage() {
    const t = useTranslations()
    const { data: session } = useSession()

    const [medicines, setMedicines] = useState<PatientMedicine[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMedicines()
    }, [session])

    const fetchMedicines = async () => {
        try {
            const patientRes = await fetch('/api/patients')
            const patientData = await patientRes.json()

            if (patientData.success && patientData.data.length > 0) {
                const patient = patientData.data[0]

                // Get full patient details with medicines
                const detailsRes = await fetch(`/api/patients/${patient.id}`)
                const detailsData = await detailsRes.json()

                if (detailsData.success) {
                    setMedicines(detailsData.data.medicines || [])
                }
            }
        } catch (error) {
            console.error('Error fetching medicines:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConfirm = async (medicineId: string) => {
        try {
            const response = await fetch(`/api/patient-medicines/${medicineId}/confirm`, {
                method: 'PUT',
            })

            const data = await response.json()

            if (data.success) {
                fetchMedicines()
            }
        } catch (error) {
            console.error('Error confirming medicine:', error)
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
                <h1 className="page-title">{t('nav.myMedicines')}</h1>
                <p className="page-subtitle">{t('medicines.title')}</p>
            </div>

            {medicines.length > 0 ? (
                <div className={styles.medicinesList}>
                    {medicines.map((med) => (
                        <div key={med.id} className={`card ${styles.medicineCard}`}>
                            <div className="card-body">
                                <div className={styles.medicineHeader}>
                                    <div className={styles.medicineIcon}>💊</div>
                                    <div className={styles.medicineInfo}>
                                        <h3 className={styles.medicineName}>{med.medicine.name}</h3>
                                        {med.medicine.description && (
                                            <p className={styles.medicineDesc}>{med.medicine.description}</p>
                                        )}
                                    </div>
                                    <div>
                                        {med.confirmed ? (
                                            <span className="badge badge-success">{t('medicines.confirmed')}</span>
                                        ) : (
                                            <span className="badge badge-warning">{t('medicines.pending')}</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.medicineDetails}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>{t('medicines.dosage')}</span>
                                        <span className={styles.detailValue}>{med.dosage}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>{t('medicines.frequency')}</span>
                                        <span className={styles.detailValue}>{med.frequency}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>{t('medicines.duration')}</span>
                                        <span className={styles.detailValue}>{med.durationDays} days</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>{t('nutrition.startDate')}</span>
                                        <span className={styles.detailValue}>
                                            {new Date(med.startDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {med.notes && (
                                    <div className={styles.notes}>
                                        <strong>{t('common.notes')}:</strong> {med.notes}
                                    </div>
                                )}

                                {!med.confirmed && (
                                    <button
                                        className="btn btn-primary mt-4"
                                        onClick={() => handleConfirm(med.id)}
                                    >
                                        ✓ {t('medicines.confirmIntake')}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">💊</div>
                    <div className="empty-state-title">{t('medicines.noMedicines')}</div>
                    <div className="empty-state-desc">{t('common.noData')}</div>
                </div>
            )}
        </div>
    )
}
