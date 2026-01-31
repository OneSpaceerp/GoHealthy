import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Providers from '@/components/Providers'
import { getDirection } from '@/i18n'
import './globals.css'

export const metadata: Metadata = {
  title: 'GoHealthy - Medical Nutrition Platform',
  description: 'Track your nutrition, monitor progress, and achieve your health goals with professional guidance.',
  keywords: 'nutrition, health, diet, medical, doctor, patient, meal plan, weight loss',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'en'
  const direction = getDirection(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body>
        <Providers>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  )
}
