import Link from 'next/link'
import styles from './Footer.module.css'

interface FooterProps {
    translations: {
        appName: string
    }
}

export default function Footer({ translations }: FooterProps) {
    const currentYear = new Date().getFullYear()

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <span className={styles.logo}>🥗 {translations.appName}</span>
                    <p className={styles.copyright}>
                        © {currentYear} {translations.appName}. All rights reserved.
                    </p>
                </div>

                <div className={styles.links}>
                    <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
                    <Link href="/terms" className={styles.link}>Terms of Service</Link>
                    <Link href="/contact" className={styles.link}>Contact</Link>
                </div>
            </div>
        </footer>
    )
}
