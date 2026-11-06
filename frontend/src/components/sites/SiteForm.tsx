
import { useState, type FormEvent } from 'react'
import type { Site } from '../../services/api'

type SiteFormProps = {
  editing: Site | null
  loading: boolean
  onSave: (data: Omit<Site, 'id'>) => void
  onCancel: () => void
}

type SiteFormData = {
  clientName: string
  address: string
  latitude: string
  longitude: string
  roofAreaM2: string
  peakKwp: string
}

const emptyForm: SiteFormData = {
  clientName: '',
  address: '',
  latitude: '',
  longitude: '',
  roofAreaM2: '',
  peakKwp: '',
}

function SiteForm({
  editing,
  loading,
  onSave,
  onCancel,
}: SiteFormProps) {
  const [form, setForm] = useState<SiteFormData>(() =>
    editing
      ? {
        clientName: editing.clientName,
        address: editing.address,
        latitude: String(editing.latitude),
        longitude: String(editing.longitude),
        roofAreaM2: editing.roofAreaM2
          ? String(editing.roofAreaM2)
          : '',
        peakKwp: String(editing.peakKwp),
      }
      : emptyForm
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSave({
      clientName: form.clientName,
      address: form.address,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      ...(form.roofAreaM2
        ? { roofAreaM2: Number(form.roofAreaM2) }
        : {}),
      peakKwp: Number(form.peakKwp),
    })
  }

  function updateField(field: keyof SiteFormData, value: string) {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }))
  }

  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">SITE MANAGEMENT</p>
          <h2>{editing ? 'Edit site' : 'Add a client site'}</h2>
        </div>
        <span className="form-symbol">＋</span>
      </div>

      <form className="site-form" onSubmit={handleSubmit}>
        <label htmlFor="clientName">Client name</label>
        <input
          id="clientName"
          required
          value={form.clientName}
          onChange={event =>
            updateField('clientName', event.target.value)
          }
          placeholder="Client name"
        />

        <label htmlFor="address">Address</label>
        <input
          id="address"
          required
          value={form.address}
          onChange={event => updateField('address', event.target.value)}
          placeholder="Street, city, country"
        />

        <div className="form-row">
          <div>
            <label htmlFor="latitude">Latitude</label>
            <input
              id="latitude"
              type="number"
              step="any"
              required
              value={form.latitude}
              onChange={event =>
                updateField('latitude', event.target.value)
              }
              placeholder="52.3676"
            />
          </div>

          <div>
            <label htmlFor="longitude">Longitude</label>
            <input
              id="longitude"
              type="number"
              step="any"
              required
              value={form.longitude}
              onChange={event =>
                updateField('longitude', event.target.value)
              }
              placeholder="4.9041"
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="roofAreaM2">Roof area (m²)</label>
            <input
              id="roofAreaM2"
              type="number"
              min="0.01"
              step="any"
              value={form.roofAreaM2}
              onChange={event =>
                updateField('roofAreaM2', event.target.value)
              }
              placeholder="Optional"
            />
          </div>

          <div>
            <label htmlFor="peakKwp">Peak power (kWp)</label>
            <input
              id="peakKwp"
              type="number"
              min="0.01"
              step="any"
              required
              value={form.peakKwp}
              onChange={event =>
                updateField('peakKwp', event.target.value)
              }
              placeholder="5"
            />
          </div>
        </div>

        <button className="primary full" disabled={loading}>
          {loading
            ? 'Saving...'
            : editing
              ? 'Save changes'
              : 'Add site'}
        </button>

        {editing && (
          <button
            type="button"
            className="secondary full"
            onClick={onCancel}
          >
            Cancel editing
          </button>
        )}
      </form>
    </div>
  )
}

export default SiteForm
