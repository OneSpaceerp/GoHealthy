'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import styles from './login.module.css'

export default function LoginPage() {
    const t = useTranslations()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError(t('auth.invalidCredentials'))
            } else {
                router.push('/dashboard')
                router.refresh()
            }
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
                    <h1 className={styles.title}>{t('auth.loginTitle')}</h1>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            {t('common.email')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="name@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            {t('common.password')}
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
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
                            t('common.login')
                        )}
                    </button>
                </form>

                <p className={styles.footer}>
                    {t('auth.noAccount')}{' '}
                    <Link href="/register" className={styles.link}>
                        {t('common.register')}
                    </Link>
                </p>
            </div>
        </div>
    )
}
