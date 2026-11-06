
import type { Production } from '../../services/api'

type ProductionAnalysisProps = {
  production: Production | null
}

function ProductionAnalysis({ production }: ProductionAnalysisProps) {
  if (!production) {
    return (
      <section className="analysis-panel">
        <p>Loading production data...</p>
      </section>
    )
  }

  const months = production.monthlyKwh
  const maxProduction = Math.max(...months.map((month) => month.kwh), 1)

  return (
    <section className="analysis-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">ENERGY OVERVIEW</span>
          <h2>Production analysis</h2>
        </div>
        <span className="analysis-symbol">☀</span>
      </div>

      <div className="production-total">
        <div>
          <strong>{Math.round(production.yearlyKwh).toLocaleString()}</strong>
          <span>kWh / year</span>
        </div>
        <span className="green-tag">PVGIS estimate</span>
      </div>

      <h3>Monthly production</h3>

      <div className="chart">
        {months.map((month) => (
          <div className="chart-column" key={month.month}>
            <span className="chart-value">
              {Math.round(month.kwh)}
            </span>

            <div className="chart-track">
              <div
                className="chart-bar"
                style={{
                  height: `${(month.kwh / maxProduction) * 100}%`,
                }}
              />
            </div>

            <span className="chart-month">
              {new Date(2000, month.month - 1).toLocaleString('en', { month: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProductionAnalysis
