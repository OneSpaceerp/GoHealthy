import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Using string literals for enums since we're running before Prisma client generation
type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT'
type Gender = 'MALE' | 'FEMALE'
type DayType = 'DAY_1' | 'DAY_15' | 'DAY_30'

async function main() {
    console.log('🌱 Seeding database...')

    // Create Admin
    const adminPassword = await hash('admin', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gohealthy.com' },
        update: {},
        create: {
            email: 'admin@gohealthy.com',
            password: adminPassword,
            name: 'admin',
            role: 'ADMIN',
            language: 'en',
        },
    })
    console.log('✅ Created admin:', admin.email)

    // Create Doctor
    const doctorPassword = await hash('123456', 12)
    const doctor = await prisma.user.upsert({
        where: { email: 'mohamed@gohealthy.com' },
        update: {},
        create: {
            email: 'mohamed@gohealthy.com',
            password: doctorPassword,
            name: 'mohamed',
            role: 'DOCTOR',
            language: 'en',
        },
    })
    console.log('✅ Created doctor:', doctor.email)

    // Create Patient User
    const patientPassword = await hash('123456', 12)
    const patientUser = await prisma.user.upsert({
        where: { email: 'khaled@gohealthy.com' },
        update: {},
        create: {
            email: 'khaled@gohealthy.com',
            password: patientPassword,
            name: 'khaled',
            role: 'PATIENT',
            language: 'ar',
        },
    })
    console.log('✅ Created patient user:', patientUser.email)

    // Create Patient Profile
    const patient = await prisma.patient.upsert({
        where: { userId: patientUser.id },
        update: {},
        create: {
            userId: patientUser.id,
            doctorId: doctor.id,
            fullName: 'Mohammad Ali',
            age: 35,
            gender: 'MALE',
            height: 175,
            weight: 85,
            medicalConditions: 'Type 2 Diabetes',
            allergies: 'None',
            currentMedications: 'Metformin 500mg',
            notes: 'Looking to lose 10kg in 3 months',
            startDate: new Date(),
        },
    })
    console.log('✅ Created patient profile')

    // Create Nutrition Plan
    const nutritionPlan = await prisma.nutritionPlan.upsert({
        where: { id: 'demo-plan-1' },
        update: {},
        create: {
            id: 'demo-plan-1',
            doctorId: doctor.id,
            patientId: patient.id,
            title: 'Weight Loss Plan - Phase 1',
            description: 'A balanced nutrition plan designed for gradual weight loss while managing blood sugar levels.',
            meals: [
                {
                    name: 'Breakfast',
                    time: '07:00',
                    description: 'Oatmeal with berries and almonds, boiled eggs',
                    calories: 400,
                    protein: 25,
                    carbs: 45,
                    fats: 15,
                },
                {
                    name: 'Morning Snack',
                    time: '10:00',
                    description: 'Greek yogurt with honey',
                    calories: 150,
                    protein: 15,
                    carbs: 10,
                    fats: 5,
                },
                {
                    name: 'Lunch',
                    time: '13:00',
                    description: 'Grilled chicken breast with quinoa and vegetables',
                    calories: 500,
                    protein: 40,
                    carbs: 50,
                    fats: 15,
                },
                {
                    name: 'Afternoon Snack',
                    time: '16:00',
                    description: 'Mixed nuts and an apple',
                    calories: 200,
                    protein: 5,
                    carbs: 20,
                    fats: 12,
                },
                {
                    name: 'Dinner',
                    time: '19:00',
                    description: 'Grilled fish with steamed vegetables and brown rice',
                    calories: 450,
                    protein: 35,
                    carbs: 40,
                    fats: 18,
                },
            ],
            totalCalories: 1700,
            proteinGrams: 120,
            carbsGrams: 165,
            fatsGrams: 65,
            allowedFoods: 'Lean proteins (chicken, fish, turkey)\nComplex carbohydrates (brown rice, quinoa, oats)\nFresh vegetables\nFruits (in moderation)\nNuts and seeds\nOlive oil\nLow-fat dairy',
            restrictedFoods: 'White sugar and sweets\nWhite bread and pasta\nFried foods\nSodas and juices\nProcessed foods\nRed meat (limit to once per week)',
            supplements: 'Vitamin D - 1000 IU daily\nOmega 3 - 1000mg daily\nMultivitamin - 1 tablet daily',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
        },
    })
    console.log('✅ Created nutrition plan')

    // Create Medicine
    const medicine = await prisma.medicine.upsert({
        where: { id: 'demo-medicine-1' },
        update: {},
        create: {
            id: 'demo-medicine-1',
            doctorId: doctor.id,
            name: 'Vitamin D3',
            description: 'Vitamin D supplement for bone health and immune support',
        },
    })
    console.log('✅ Created medicine')

    // Assign Medicine to Patient
    await prisma.patientMedicine.upsert({
        where: {
            patientId_medicineId: {
                patientId: patient.id,
                medicineId: medicine.id,
            },
        },
        update: {},
        create: {
            patientId: patient.id,
            medicineId: medicine.id,
            dosage: '1000 IU',
            frequency: 'Once daily',
            durationDays: 90,
            notes: 'Take with breakfast',
            startDate: new Date(),
        },
    })
    console.log('✅ Assigned medicine to patient')

    // Create Sample Measurements
    const measurement1 = await prisma.measurement.create({
        data: {
            patientId: patient.id,
            dayType: 'DAY_1',
            weight: 85,
            armCircumference: 32,
            waistOnNavel: 96,
            waistAboveNavel: 92,
            hipCircumference: 102,
            thighCircumference: 58,
            notes: 'Initial measurements',
            measuredAt: new Date(),
        },
    })
    console.log('✅ Created day 1 measurement')

    console.log('')
    console.log('🎉 Database seeded successfully!')
    console.log('')
    console.log('📧 Login credentials:')
    console.log('   Admin:   admin@gohealthy.com / admin123')
    console.log('   Doctor:  doctor@gohealthy.com / doctor123')
    console.log('   Patient: patient@gohealthy.com / patient123')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
