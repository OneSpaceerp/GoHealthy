'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import styles from './users.module.css'

interface User {
    id: string
    email: string
    name: string
    role: string
    language: string
    createdAt: string
}

export default function AdminUsersPage() {
    const t = useTranslations()
    const { data: session } = useSession()

    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [session, filter])

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams()
            if (filter) params.append('role', filter)
            if (search) params.append('search', search)

            const response = await fetch(`/api/users?${params.toString()}`)
            const data = await response.json()

            if (data.success) {
                setUsers(data.data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchUsers()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="spinner spinner-lg"></div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <div className="page-header">
                <h1 className="page-title">{t('nav.users')}</h1>
                <p className="page-subtitle">{t('admin.manageUsers')}</p>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="card-body">
                    <div className={styles.filters}>
                        <form onSubmit={handleSearch} className={styles.searchForm}>
                            <input
                                type="text"
                                placeholder={t('common.search')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="form-input"
                            />
                            <button type="submit" className="btn btn-primary">
                                🔍
                            </button>
                        </form>
                        <div className="tabs">
                            <button
                                className={`tab ${filter === '' ? 'active' : ''}`}
                                onClick={() => setFilter('')}
                            >
                                All
                            </button>
                            <button
                                className={`tab ${filter === 'ADMIN' ? 'active' : ''}`}
                                onClick={() => setFilter('ADMIN')}
                            >
                                Admins
                            </button>
                            <button
                                className={`tab ${filter === 'DOCTOR' ? 'active' : ''}`}
                                onClick={() => setFilter('DOCTOR')}
                            >
                                Doctors
                            </button>
                            <button
                                className={`tab ${filter === 'PATIENT' ? 'active' : ''}`}
                                onClick={() => setFilter('PATIENT')}
                            >
                                Patients
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            {users.length > 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t('common.name')}</th>
                                        <th>{t('common.email')}</th>
                                        <th>{t('admin.userRole')}</th>
                                        <th>{t('common.language')}</th>
                                        <th>{t('common.date')}</th>
                                        <th>{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-sm">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge ${user.role === 'ADMIN' ? 'badge-warning' :
                                                        user.role === 'DOCTOR' ? 'badge-info' :
                                                            'badge-success'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-secondary">
                                                    {user.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'}
                                                </span>
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="btn btn-sm btn-secondary">
                                                        ✏️
                                                    </button>
                                                    {user.role !== 'ADMIN' && (
                                                        <button className="btn btn-sm btn-outline">
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">{t('common.noData')}</div>
                </div>
            )}
        </div>
    )
}
