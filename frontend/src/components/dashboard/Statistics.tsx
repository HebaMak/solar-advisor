
type StatisticsProps = {
  siteCount: number
  selectedSite: number | null
  yearlyProduction: number | null
}

function Statistics({
  siteCount,
  selectedSite,
  yearlyProduction,
}: StatisticsProps) {
  return (
    <section className="stats">
      <div className="stat-card">
        <span>CLIENT SITES</span>
        <strong>{siteCount}</strong>
        <small>Managed locations</small>
      </div>

      <div className="stat-card">
        <span>SELECTED SITE</span>
        <strong>{selectedSite ? `#${selectedSite}` : '—'}</strong>
        <small>Current analysis</small>
      </div>

      <div className="stat-card">
        <span>YEARLY PRODUCTION</span>
        <strong>
          {yearlyProduction !== null
            ? `${yearlyProduction.toLocaleString()} kWh`
            : '—'}
        </strong>
        <small>Estimated solar energy</small>
      </div>
    </section>
  )
}

export default Statistics
