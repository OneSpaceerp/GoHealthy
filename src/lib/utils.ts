import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function formatDate(date: Date | string, locale: string = 'en'): string {
    const d = new Date(date)
    return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export function calculateBMI(weight: number, heightCm: number): number {
    const heightM = heightCm / 100
    return Number((weight / (heightM * heightM)).toFixed(1))
}

export function getBMICategory(bmi: number, locale: string = 'en'): string {
    const categories = {
        en: {
            underweight: 'Underweight',
            normal: 'Normal',
            overweight: 'Overweight',
            obese: 'Obese',
        },
        ar: {
            underweight: 'نقص الوزن',
            normal: 'طبيعي',
            overweight: 'زيادة الوزن',
            obese: 'سمنة',
        },
    }

    const lang = locale === 'ar' ? 'ar' : 'en'

    if (bmi < 18.5) return categories[lang].underweight
    if (bmi < 25) return categories[lang].normal
    if (bmi < 30) return categories[lang].overweight
    return categories[lang].obese
}

export function getDayTypeLabel(dayType: string, locale: string = 'en'): string {
    const labels: Record<string, Record<string, string>> = {
        DAY_1: { en: 'Day 1', ar: 'اليوم الأول' },
        DAY_15: { en: 'Day 15', ar: 'اليوم 15' },
        DAY_30: { en: 'Day 30', ar: 'اليوم 30' },
    }
    return labels[dayType]?.[locale] || dayType
}

export function getImageTypeLabel(imageType: string, locale: string = 'en'): string {
    const labels: Record<string, Record<string, string>> = {
        FRONT: { en: 'Front', ar: 'أمامي' },
        SIDE: { en: 'Side', ar: 'جانبي' },
        BACK: { en: 'Back', ar: 'خلفي' },
    }
    return labels[imageType]?.[locale] || imageType
}
