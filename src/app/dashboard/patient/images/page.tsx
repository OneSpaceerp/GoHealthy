'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import styles from './images.module.css'

interface PatientImage {
    id: string
    dayType: string
    imageType: string
    imagePath: string
    notes: string | null
    uploadedAt: string
}

export default function ImagesPage() {
    const t = useTranslations()
    const { data: session } = useSession()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [images, setImages] = useState<PatientImage[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [patientId, setPatientId] = useState<string | null>(null)
    const [activeDay, setActiveDay] = useState('DAY_1')
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        dayType: 'DAY_1',
        imageType: 'FRONT',
        notes: '',
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        fetchPatientAndImages()
    }, [session])

    const fetchPatientAndImages = async () => {
        try {
            const patientRes = await fetch('/api/patients')
            const patientData = await patientRes.json()

            if (patientData.success && patientData.data.length > 0) {
                const patient = patientData.data[0]
                setPatientId(patient.id)

                const imagesRes = await fetch(`/api/patients/${patient.id}/images`)
                const imagesData = await imagesRes.json()

                if (imagesData.success) {
                    setImages(imagesData.data)
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!patientId || !selectedFile) return

        setUploading(true)
        setMessage({ type: '', text: '' })

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('file', selectedFile)
            formDataToSend.append('dayType', formData.dayType)
            formDataToSend.append('imageType', formData.imageType)
            formDataToSend.append('notes', formData.notes)

            const response = await fetch(`/api/patients/${patientId}/images`, {
                method: 'POST',
                body: formDataToSend,
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: t('common.success') })
                setShowModal(false)
                setSelectedFile(null)
                setPreview(null)
                setFormData({ dayType: 'DAY_1', imageType: 'FRONT', notes: '' })
                fetchPatientAndImages()
            } else {
                setMessage({ type: 'error', text: data.error })
            }
        } catch {
            setMessage({ type: 'error', text: t('errors.serverError') })
        } finally {
            setUploading(false)
        }
    }

    const filteredImages = images.filter(img => img.dayType === activeDay)

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
                    <h1 className="page-title">{t('images.title')}</h1>
                    <p className="page-subtitle">{t('images.instructionsText')}</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    📸 {t('images.uploadImage')}
                </button>
            </div>

            {/* Instructions */}
            <div className="alert alert-info mb-6">
                <strong>{t('images.uploadInstructions')}:</strong> {t('images.instructionsText')}
            </div>

            {/* Day Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeDay === 'DAY_1' ? 'active' : ''}`}
                    onClick={() => setActiveDay('DAY_1')}
                >
                    {t('measurements.day1')} ({images.filter(i => i.dayType === 'DAY_1').length})
                </button>
                <button
                    className={`tab ${activeDay === 'DAY_15' ? 'active' : ''}`}
                    onClick={() => setActiveDay('DAY_15')}
                >
                    {t('measurements.day15')} ({images.filter(i => i.dayType === 'DAY_15').length})
                </button>
                <button
                    className={`tab ${activeDay === 'DAY_30' ? 'active' : ''}`}
                    onClick={() => setActiveDay('DAY_30')}
                >
                    {t('measurements.day30')} ({images.filter(i => i.dayType === 'DAY_30').length})
                </button>
            </div>

            {/* Image Gallery */}
            {filteredImages.length > 0 ? (
                <div className={styles.gallery}>
                    {filteredImages.map((image) => (
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
                                <span className={`badge badge-${image.imageType === 'FRONT' ? 'primary' :
                                        image.imageType === 'SIDE' ? 'info' : 'warning'
                                    }`}>
                                    {t(`images.${image.imageType.toLowerCase()}`)}
                                </span>
                                <span className={styles.imageDate}>
                                    {new Date(image.uploadedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">📸</div>
                    <div className="empty-state-title">{t('images.noImages')}</div>
                    <div className="empty-state-desc">{t('common.noData')}</div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        {t('images.uploadImage')}
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{t('images.uploadImage')}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpload}>
                            <div className="modal-body">
                                {message.text && (
                                    <div className={`alert alert-${message.type} mb-4`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">{t('images.dayType')}</label>
                                    <select
                                        value={formData.dayType}
                                        onChange={(e) => setFormData({ ...formData, dayType: e.target.value })}
                                        className="form-select"
                                    >
                                        <option value="DAY_1">{t('measurements.day1')}</option>
                                        <option value="DAY_15">{t('measurements.day15')}</option>
                                        <option value="DAY_30">{t('measurements.day30')}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('images.imageType')}</label>
                                    <select
                                        value={formData.imageType}
                                        onChange={(e) => setFormData({ ...formData, imageType: e.target.value })}
                                        className="form-select"
                                    >
                                        <option value="FRONT">{t('images.front')}</option>
                                        <option value="SIDE">{t('images.side')}</option>
                                        <option value="BACK">{t('images.back')}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('common.notes')}</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="form-textarea"
                                        rows={2}
                                    />
                                </div>

                                <div className={styles.uploadArea}>
                                    {preview ? (
                                        <div className={styles.previewContainer}>
                                            <Image
                                                src={preview}
                                                alt="Preview"
                                                fill
                                                style={{ objectFit: 'contain' }}
                                            />
                                            <button
                                                type="button"
                                                className={styles.removeBtn}
                                                onClick={() => {
                                                    setSelectedFile(null)
                                                    setPreview(null)
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className={styles.dropzone}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <span className={styles.dropzoneIcon}>📤</span>
                                            <span>Click to select image</span>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className={styles.hiddenInput}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!selectedFile || uploading}
                                >
                                    {uploading ? <span className="spinner" /> : t('images.uploadImage')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
