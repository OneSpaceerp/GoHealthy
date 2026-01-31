'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import styles from './LanguageSwitch.module.css'

interface LanguageSwitchProps {
    currentLocale: string
}

export default function LanguageSwitch({ currentLocale }: LanguageSwitchProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const handleLanguageChange = async (locale: string) => {
        if (locale === currentLocale) return

        try {
            await fetch('/api/set-language', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale }),
            })

            startTransition(() => {
                router.refresh()
                router.push(pathname)
            })
        } catch (error) {
            console.error('Error changing language:', error)
        }
    }

    return (
        <div className={styles.switch}>
            <button
                className={`${styles.btn} ${currentLocale === 'en' ? styles.active : ''}`}
                onClick={() => handleLanguageChange('en')}
                disabled={isPending}
            >
                🇬🇧 EN
            </button>
            <button
                className={`${styles.btn} ${currentLocale === 'ar' ? styles.active : ''}`}
                onClick={() => handleLanguageChange('ar')}
                disabled={isPending}
            >
                🇸🇦 AR
            </button>
        </div>
    )
}
