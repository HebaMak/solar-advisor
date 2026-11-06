
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DashboardHeader from '../components/dashboard/DashboardHeader'
import WelcomeSection from '../components/dashboard/WelcomeSection'
import Statistics from '../components/dashboard/Statistics'
import SiteList from '../components/sites/SiteList'
import SiteForm from '../components/sites/SiteForm'
import ProductionAnalysis from '../components/analysis/ProductionAnalysis'
import BatteryComparison from '../components/analysis/BatteryComparison'

import {
  authApi,
  sitesApi,
  type Site,
  type Production,
  type BatteryResult,
} from '../services/api'

import '../styles/dashboard.css'

function DashboardPage() {
  const navigate = useNavigate()

  const [user, setUser] = useState('')
  const [sites, setSites] = useState<Site[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [production, setProduction] = useState<Production | null>(null)
  const [battery, setBattery] = useState<BatteryResult | null>(null)
  const [editing, setEditing] = useState<Site | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function initializeDashboard() {
      try {
        const account = await authApi.me()
        setUser(account.email)

        const data = await sitesApi.getAll()
        setSites(data)
      } catch {
        sessionStorage.removeItem('csrfToken')
        navigate('/', { replace: true })
      }
    }

    initializeDashboard()
  }, [navigate])

  async function refreshSites() {
    const data = await sitesApi.getAll()
    setSites(data)
  }

  async function handleLogout() {
    try {
      await authApi.logout()
      sessionStorage.removeItem('csrfToken')
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed.')
    }
  }

  async function handleSelectSite(id: number) {
    setSelected(id)
    setProduction(null)
    setBattery(null)
    setError('')
    setMessage('')

    try {
      const result = await sitesApi.production(id)
      setProduction(result)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load production.'
      )
    }
  }

  async function handleSaveSite(data: Omit<Site, 'id'>) {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const savedSite = editing
        ? await sitesApi.update(editing.id, data)
        : await sitesApi.create(data)

      await refreshSites()

      setSelected(savedSite.id)
      setProduction(null)
      setBattery(null)
      setEditing(null)

      setMessage(
        editing ? 'Site updated successfully.' : 'Site added successfully.'
      )

      await handleSelectSite(savedSite.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save site.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteSite(id: number) {
    if (!window.confirm('Are you sure you want to delete this site?')) {
      return
    }

    try {
      await sitesApi.delete(id)
      setSites(previous => previous.filter(site => site.id !== id))

      if (selected === id) {
        setSelected(null)
        setProduction(null)
        setBattery(null)
      }

      setMessage('Site deleted successfully.')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete site.')
    }
  }

  async function handleCalculateBattery(
    capacityKwh: number,
    annualUseKwh: number
  ) {
    if (selected === null) return

    setLoading(true)
    setError('')

    try {
      const result = await sitesApi.battery(
        selected,
        capacityKwh,
        annualUseKwh
      )
      setBattery(result)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Battery calculation failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="dashboard">
        <WelcomeSection />

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <Statistics
          siteCount={sites.length}
          selectedSite={selected}
          yearlyProduction={production?.yearlyKwh ?? null}
        />

        <section className="content-grid">
          <SiteList
            sites={sites}
            selected={selected}
            onSelect={handleSelectSite}
            onEdit={setEditing}
            onDelete={handleDeleteSite}
          />

          <SiteForm
            key={editing?.id ?? 'new'}
            editing={editing}
            loading={loading}
            onSave={handleSaveSite}
            onCancel={() => setEditing(null)}
          />
        </section>

        {selected !== null && (
          <>
            <ProductionAnalysis production={production} />

            {production && (
              <BatteryComparison
                battery={battery}
                loading={loading}
                onCalculate={handleCalculateBattery}
              />
            )}
          </>
        )}

        <footer>Solar Advisor · Powered by PVGIS</footer>
      </main>
    </div>
  )
}

export default DashboardPage
