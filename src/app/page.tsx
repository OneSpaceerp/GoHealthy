import Link from 'next/link'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import styles from './page.module.css'

export default async function HomePage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'en'
  const t = await getTranslations()

  const headerTranslations = {
    appName: t('common.appName'),
    login: t('common.login'),
    logout: t('common.logout'),
    dashboard: t('common.dashboard'),
  }

  const footerTranslations = {
    appName: t('common.appName'),
  }

  return (
    <div className={styles.page}>
      <Header locale={locale} translations={headerTranslations} />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{t('landing.heroTitle')}</h1>
            <p className={styles.heroSubtitle}>{t('landing.heroSubtitle')}</p>
            <div className={styles.heroActions}>
              <Link href="/register" className="btn btn-primary btn-lg">
                {t('landing.getStarted')}
              </Link>
              <Link href="#features" className="btn btn-outline btn-lg">
                {t('landing.learnMore')}
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroImagePlaceholder}>
              <span>🥗</span>
              <span>📊</span>
              <span>💪</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={styles.features}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t('landing.features')}</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🥗</div>
                <h3 className={styles.featureTitle}>{t('landing.feature1Title')}</h3>
                <p className={styles.featureDesc}>{t('landing.feature1Desc')}</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📈</div>
                <h3 className={styles.featureTitle}>{t('landing.feature2Title')}</h3>
                <p className={styles.featureDesc}>{t('landing.feature2Desc')}</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>👨‍⚕️</div>
                <h3 className={styles.featureTitle}>{t('landing.feature3Title')}</h3>
                <p className={styles.featureDesc}>{t('landing.feature3Desc')}</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🌍</div>
                <h3 className={styles.featureTitle}>{t('landing.feature4Title')}</h3>
                <p className={styles.featureDesc}>{t('landing.feature4Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className={styles.about}>
          <div className={styles.container}>
            <div className={styles.aboutContent}>
              <h2 className={styles.aboutTitle}>{t('landing.aboutTitle')}</h2>
              <p className={styles.aboutDesc}>{t('landing.aboutDesc')}</p>
              <div className={styles.aboutStats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>500+</span>
                  <span className={styles.statLabel}>{t('dashboard.totalPatients')}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>50+</span>
                  <span className={styles.statLabel}>{t('dashboard.totalDoctors')}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>1000+</span>
                  <span className={styles.statLabel}>{t('dashboard.activePlans')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>{t('landing.heroTitle')}</h2>
            <p className={styles.ctaDesc}>{t('landing.heroSubtitle')}</p>
            <Link href="/register" className="btn btn-primary btn-lg">
              {t('landing.getStarted')}
            </Link>
          </div>
        </section>
      </main>

      <Footer translations={footerTranslations} />
    </div>
  )
}
