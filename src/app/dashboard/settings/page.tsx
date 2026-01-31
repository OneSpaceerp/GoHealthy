'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import styles from './settings.module.css'

export default function SettingsPage() {
    const t = useTranslations()

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: t('errors.passwordMismatch') })
            setLoading(false)
            return
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: t('errors.passwordTooShort') })
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/users/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: t('settings.passwordChanged') })
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                })
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
                <h1 className="page-title">{t('nav.settings')}</h1>
                <p className="page-subtitle">{t('settings.changePassword')}</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">🔐 {t('settings.changePassword')}</h2>
                </div>
                <div className="card-body">
                    {message.text && (
                        <div className={`alert alert-${message.type} mb-6`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className="form-group">
                            <label htmlFor="currentPassword" className="form-label">
                                {t('settings.currentPassword')} *
                            </label>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="form-input"
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">
                                {t('settings.newPassword')} *
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="form-input"
                                required
                                minLength={6}
                                placeholder="••••••••"
                            />
                            <span className="form-hint">{t('settings.passwordHint')}</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                {t('settings.confirmPassword')} *
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                required
                                minLength={6}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? <span className="spinner" /> : t('settings.updatePassword')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
