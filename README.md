# GoHealthy - Medical Nutrition Web Application

A production-ready, bilingual (Arabic 🇸🇦 / English 🇬🇧) medical nutrition platform for doctors, patients, and administrators to track nutrition plans, medical data, body measurements, images, and progress over time.

![GoHealthy Logo](https://img.shields.io/badge/GoHealthy-Medical%20Nutrition-4CAF50?style=for-the-badge&logo=leaf)

## 🌟 Features

### 🔐 Role-Based Access Control

| Role | Capabilities |
|------|-------------|
| **Admin** 🔑 | Full access to all data, manage users, modify any nutrition plan/medicine/patient data, view analytics |
| **Doctor** 🧑‍⚕️ | Create/update/delete nutrition plans & medicines, assign plans to patients, view patient progress |
| **Patient** 🧑 | Enter personal & medical data, upload images, enter measurements, view assigned plans & medicines |

### 📊 Patient Data Management
- Complete personal & medical information tracking
- Body measurements on Day 1, Day 15, and Day 30
- Progress images with same location/lighting/posture requirements
- Medical conditions, allergies, and current medications

### 📏 Body Measurements
- Weight tracking
- Arm circumference (relaxed arm)
- Waist circumference (on navel and 4 fingers above)
- Hip circumference
- Thigh circumference (midpoint between hip and knee)

### 🥗 Nutrition Plans
- Daily meals with timing
- Macronutrient tracking (Calories, Protein, Carbs, Fats)
- Allowed and restricted foods lists
- Supplements recommendations

### 💊 Medicine Management
- Medicine assignment with dosage and frequency
- Duration tracking
- Patient intake confirmation

### 🌍 Bilingual Support
- Arabic (RTL) and English (LTR)
- Automatic direction switching
- Complete translation coverage

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Vanilla CSS with CSS Variables
- **Charts**: Recharts
- **Internationalization**: next-intl

## 📁 Project Structure

```
go-healthy/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Sample data
├── messages/
│   ├── en.json            # English translations
│   └── ar.json            # Arabic translations
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication
│   │   │   ├── patients/  # Patient CRUD
│   │   │   ├── nutrition-plans/
│   │   │   ├── medicines/
│   │   │   └── users/
│   │   ├── dashboard/
│   │   │   ├── admin/     # Admin dashboard
│   │   │   ├── doctor/    # Doctor dashboard
│   │   │   └── patient/   # Patient dashboard
│   │   ├── (auth)/        # Auth pages
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   ├── lib/               # Utilities
│   └── types/             # TypeScript types
└── public/
    └── uploads/           # User uploads
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd go-healthy
npm install
```

2. **Configure environment variables:**
```bash
# Create .env file with:
DATABASE_URL="postgresql://user:password@localhost:5432/gohealthy"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Set up the database:**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📧 Demo Credentials

After running the seed script:

| Role | Email | Username | Password |
|------|-------|----------|----------|
| Admin | admin@gohealthy.com | admin | admin |
| Doctor | mohamed@gohealthy.com | mohamed | 123456 |
| Patient | khaled@gohealthy.com | khaled | 123456 |

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create migration |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## 🗄️ Database Schema

### Main Entities
- **User**: Authentication and role management
- **Patient**: Patient profile with medical info
- **Measurement**: Body measurements for Day 1/15/30
- **PatientImage**: Progress images
- **NutritionPlan**: Doctor-created nutrition plans
- **Medicine**: Medicine prescriptions
- **PatientMedicine**: Medicine assignments to patients
- **AuditLog**: Activity tracking

## 🎨 Design System

### Colors
- **Primary**: `#4CAF50` (Green)
- **Secondary**: `#81C784` (Light Green)
- **Background**: `#F5F5F5`
- **Text**: `#1F2937`

### Typography
- **Font Family**: Inter, system fonts
- **Responsive sizing**: Using CSS variables

## 🔒 Security Features

- Password hashing with bcrypt
- JWT session management
- Role-based route protection
- CSRF protection via NextAuth
- API route authorization

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1200px
- Touch-friendly interfaces
- Adaptive navigation

## 🌐 Localization

Switch between languages using the toggle in the header:
- 🇬🇧 English (LTR)
- 🇸🇦 Arabic (RTL)

All UI elements, labels, and messages are fully translated.

## 📈 Future Enhancements

- [ ] Email notifications
- [ ] PDF report generation
- [ ] Mobile app (React Native)
- [ ] Video consultations
- [ ] AI-powered meal suggestions
- [ ] Wearable device integration

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

**Built with ❤️ for better health**
