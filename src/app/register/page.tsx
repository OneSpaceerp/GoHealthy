'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import styles from './register.module.css'

export default function RegisterPage() {
    const t = useTranslations()
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'PATIENT',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError(t('errors.passwordMismatch'))
            return
        }

        if (formData.password.length < 6) {
            setError(t('errors.minLength', { min: 6 }))
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || t('errors.serverError'))
                return
            }

            router.push('/login?registered=true')
        } catch {
            setError(t('errors.serverError'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>🥗</span>
                        <span className={styles.logoText}>{t('common.appName')}</span>
                    </Link>
                    <h1 className={styles.title}>{t('auth.registerTitle')}</h1>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            {t('common.name')}
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-input"
                            placeholder={t('common.name')}
                            required
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            {t('common.email')}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="name@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role" className="form-label">
                            {t('auth.selectRole')}
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="PATIENT">{t('auth.rolePatient')}</option>
                            <option value="DOCTOR">{t('auth.roleDoctor')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            {t('common.password')}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            {t('common.confirmPassword')}
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner" />
                        ) : (
                            t('common.register')
                        )}
                    </button>
                </form>

                <p className={styles.footer}>
                    {t('auth.hasAccount')}{' '}
                    <Link href="/login" className={styles.link}>
                        {t('common.login')}
                    </Link>
                </p>
            </div>
        </div>
    )
}
