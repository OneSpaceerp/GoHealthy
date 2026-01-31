import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import DashboardHeader from '@/components/layout/DashboardHeader'
import Sidebar from '@/components/layout/Sidebar'
import styles from './layout.module.css'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    const cookieStore = await cookies()
    const locale = cookieStore.get('locale')?.value || 'en'
    const t = await getTranslations()

    const headerTranslations = {
        appName: t('common.appName'),
        logout: t('common.logout'),
        settings: t('common.settings'),
    }

    const sidebarTranslations = {
        dashboard: t('nav.dashboard'),
        patients: t('nav.patients'),
        nutritionPlans: t('nav.nutritionPlans'),
        medicines: t('nav.medicines'),
        measurements: t('nav.measurements'),
        images: t('nav.images'),
        progress: t('nav.progress'),
        users: t('nav.users'),
        reports: t('nav.reports'),
        profile: t('common.profile'),
        myPlan: t('nav.myPlan'),
        myMedicines: t('nav.myMedicines'),
    }

    return (
        <div className={styles.layout}>
            <DashboardHeader locale={locale} translations={headerTranslations} />
            <div className={styles.container}>
                <Sidebar translations={sidebarTranslations} />
                <main className={styles.main}>
                    {children}
                </main>
            </div>
        </div>
    )
}
