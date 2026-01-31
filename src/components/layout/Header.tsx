'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import LanguageToggle from '../ui/LanguageToggle'
import styles from './Header.module.css'

interface HeaderProps {
    locale: string
    translations: {
        appName: string
        login: string
        logout: string
        dashboard: string
    }
}

export default function Header({ locale, translations }: HeaderProps) {
    const { data: session } = useSession()

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>🥗</span>
                    <span className={styles.logoText}>{translations.appName}</span>
                </Link>

                <nav className={styles.nav}>
                    <LanguageToggle currentLocale={locale} />

                    {session ? (
                        <div className={styles.userMenu}>
                            <Link href="/dashboard" className="btn btn-secondary btn-sm">
                                {translations.dashboard}
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="btn btn-outline btn-sm"
                            >
                                {translations.logout}
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn btn-primary btn-sm">
                            {translations.login}
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
