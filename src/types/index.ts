// Define Role type locally to avoid Prisma client dependency before generation
export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT'
export type Gender = 'MALE' | 'FEMALE'
export type DayType = 'DAY_1' | 'DAY_15' | 'DAY_30'
export type ImageType = 'FRONT' | 'SIDE' | 'BACK'

export interface User {
    id: string
    email: string
    name: string
    role: Role
    language: string
}

export interface Patient {
    id: string
    userId: string
    fullName: string
    age: number
    gender: 'MALE' | 'FEMALE'
    height: number
    weight: number
    medicalConditions?: string
    allergies?: string
    currentMedications?: string
    notes?: string
    startDate: Date
    doctorId?: string
}

export interface Measurement {
    id: string
    patientId: string
    dayType: 'DAY_1' | 'DAY_15' | 'DAY_30'
    weight?: number
    armCircumference?: number
    waistOnNavel?: number
    waistAboveNavel?: number
    hipCircumference?: number
    thighCircumference?: number
    measuredAt: Date
    notes?: string
}

export interface PatientImage {
    id: string
    patientId: string
    dayType: 'DAY_1' | 'DAY_15' | 'DAY_30'
    imageType: 'FRONT' | 'SIDE' | 'BACK'
    imagePath: string
    notes?: string
    uploadedAt: Date
}

export interface Meal {
    name: string
    time: string
    description: string
    calories: number
    protein: number
    carbs: number
    fats: number
}

export interface NutritionPlan {
    id: string
    doctorId: string
    patientId?: string
    title: string
    description?: string
    meals: Meal[]
    totalCalories: number
    proteinGrams: number
    carbsGrams: number
    fatsGrams: number
    allowedFoods?: string
    restrictedFoods?: string
    supplements?: string
    startDate?: Date
    endDate?: Date
    isActive: boolean
}

export interface Medicine {
    id: string
    doctorId: string
    name: string
    description?: string
}

export interface PatientMedicine {
    id: string
    patientId: string
    medicineId: string
    medicine?: Medicine
    dosage: string
    frequency: string
    durationDays: number
    notes?: string
    confirmed: boolean
    startDate: Date
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface DashboardStats {
    totalPatients: number
    totalDoctors: number
    activePlans: number
    totalUsers: number
}
