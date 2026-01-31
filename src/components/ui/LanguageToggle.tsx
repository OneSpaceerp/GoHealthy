'use client'

import { useRouter } from 'next/navigation'
import styles from './LanguageToggle.module.css'

interface LanguageToggleProps {
    currentLocale: string
}

export default function LanguageToggle({ currentLocale }: LanguageToggleProps) {
    const router = useRouter()

    const toggleLanguage = () => {
        const newLocale = currentLocale === 'en' ? 'ar' : 'en'
        document.cookie = `locale=${newLocale};path=/;max-age=31536000`
        router.refresh()
    }

    return (
        <button
            className={styles.toggle}
            onClick={toggleLanguage}
            aria-label="Toggle language"
        >
            <span className={`${styles.option} ${currentLocale === 'en' ? styles.active : ''}`}>
                EN
            </span>
            <span className={styles.separator}>|</span>
            <span className={`${styles.option} ${currentLocale === 'ar' ? styles.active : ''}`}>
                ع
            </span>
        </button>
    )
}
