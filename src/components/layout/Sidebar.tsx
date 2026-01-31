'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import styles from './Sidebar.module.css'

interface SidebarProps {
    translations: Record<string, string>
}

export default function Sidebar({ translations }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const role = session?.user?.role

    const adminLinks = [
        { href: '/dashboard/admin', label: translations.dashboard, icon: '📊' },
        { href: '/dashboard/admin/users', label: translations.users, icon: '👥' },
        { href: '/dashboard/admin/reports', label: translations.reports, icon: '📈' },
        { href: '/dashboard/settings', label: translations.settings, icon: '⚙️' },
    ]

    const doctorLinks = [
        { href: '/dashboard/doctor', label: translations.dashboard, icon: '📊' },
        { href: '/dashboard/doctor/patients', label: translations.patients, icon: '🧑' },
        { href: '/dashboard/doctor/nutrition-plans', label: translations.nutritionPlans, icon: '🥗' },
        { href: '/dashboard/doctor/medicines', label: translations.medicines, icon: '💊' },
        { href: '/dashboard/settings', label: translations.settings, icon: '⚙️' },
    ]

    const patientLinks = [
        { href: '/dashboard/patient', label: translations.dashboard, icon: '📊' },
        { href: '/dashboard/patient/profile', label: translations.profile, icon: '👤' },
        { href: '/dashboard/patient/measurements', label: translations.measurements, icon: '📏' },
        { href: '/dashboard/patient/images', label: translations.images, icon: '📸' },
        { href: '/dashboard/patient/nutrition-plan', label: translations.myPlan, icon: '🥗' },
        { href: '/dashboard/patient/medicines', label: translations.myMedicines, icon: '💊' },
        { href: '/dashboard/patient/progress', label: translations.progress, icon: '📈' },
        { href: '/dashboard/settings', label: translations.settings, icon: '⚙️' },
    ]

    const links = role === 'ADMIN' ? adminLinks : role === 'DOCTOR' ? doctorLinks : patientLinks

    return (
        <aside className={styles.sidebar}>
            <nav className={styles.nav}>
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
                    >
                        <span className={styles.icon}>{link.icon}</span>
                        <span className={styles.label}>{link.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    )
}
