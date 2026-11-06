
import { useState } from 'react'
import type { BatteryResult } from '../../services/api'

type BatteryComparisonProps = {
  battery: BatteryResult | null
  loading: boolean
  onCalculate: (capacityKwh: number, annualUseKwh: number) => void
}

function BatteryComparison({
  battery,
  loading,
  onCalculate,
}: BatteryComparisonProps) {
  const [capacity, setCapacity] = useState('10')
  const [annualUse, setAnnualUse] = useState('3500')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const capacityValue = Number(capacity)
    const annualUseValue = Number(annualUse)

    if (
      !Number.isFinite(capacityValue) ||
      !Number.isFinite(annualUseValue) ||
      capacityValue <= 0 ||
      annualUseValue <= 0
    ) {
      return
    }

    onCalculate(capacityValue, annualUseValue)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '36px',
    boxSizing: 'border-box',
    padding: '0 14px',
    border: '1px solid #dce5de',
    borderRadius: '8px',
    background: '#fff',
    color: '#24332c',
    fontSize: '14px',
    outline: 'none',
  }

  return (
    <section className="analysis-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">STORAGE SIMULATION</span>
          <h2>Battery comparison</h2>
        </div>
        <span className="analysis-symbol">🔋</span>
      </div>

      <p className="description">
        Compare your energy usage with and without a home battery.
      </p>

      <form className="battery-inputs" onSubmit={handleSubmit}>
        <label>
          Battery capacity (kWh)
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            style={inputStyle}
            required
          />
        </label>

        <label>
          Annual consumption (kWh)
          <input
            type="number"
            min="1"
            step="1"
            value={annualUse}
            onChange={(event) => setAnnualUse(event.target.value)}
            style={inputStyle}
            required
          />
        </label>

        <button className="primary full" type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate comparison'}
        </button>
      </form>

      {battery && (
        <div className="comparison">
          <div className="comparison-card">
            <h3>Without battery</h3>
            <p>
              Self-consumption: {battery.withoutBattery.selfConsumptionPercent.toFixed(1)}%
            </p>
            <p>
              Self-sufficiency: {battery.withoutBattery.selfSufficiencyPercent.toFixed(1)}%
            </p>
            <p>
              Grid import: {Math.round(battery.withoutBattery.gridImportKwh)} kWh
            </p>
            <p>
              Exported: {Math.round(battery.withoutBattery.exportedKwh)} kWh
            </p>
          </div>

          <div className="comparison-card highlighted">
            <h3>With battery</h3>
            <p>
              Self-consumption: {battery.withBattery.selfConsumptionPercent.toFixed(1)}%
            </p>
            <p>
              Self-sufficiency: {battery.withBattery.selfSufficiencyPercent.toFixed(1)}%
            </p>
            <p>
              Grid import: {Math.round(battery.withBattery.gridImportKwh)} kWh
            </p>
            <p>
              Exported: {Math.round(battery.withBattery.exportedKwh)} kWh
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export default BatteryComparison
