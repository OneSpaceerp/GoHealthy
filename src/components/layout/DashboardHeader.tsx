'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import LanguageToggle from '../ui/LanguageToggle'
import styles from './DashboardHeader.module.css'

interface DashboardHeaderProps {
    locale: string
    translations: {
        appName: string
        logout: string
        settings: string
    }
}

export default function DashboardHeader({ locale, translations }: DashboardHeaderProps) {
    const { data: session } = useSession()

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>🥗</span>
                    <span className={styles.logoText}>{translations.appName}</span>
                </Link>

                <div className={styles.actions}>
                    <LanguageToggle currentLocale={locale} />

                    {session?.user && (
                        <div className={styles.userSection}>
                            <div className={styles.avatar}>
                                {getInitials(session.user.name || 'U')}
                            </div>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{session.user.name}</span>
                                <span className={styles.userRole}>{session.user.role}</span>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className={styles.logoutBtn}
                                title={translations.logout}
                            >
                                🚪
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
