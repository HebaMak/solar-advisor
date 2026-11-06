
import type { Site } from '../../services/api'

type SiteListProps = {
  sites: Site[]
  selected: number | null
  onSelect: (id: number) => void
  onEdit: (site: Site) => void
  onDelete: (id: number) => void
}

function SiteList({
  sites,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: SiteListProps) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PORTFOLIO</p>
          <h2>Client sites</h2>
        </div>
        <span className="count">{sites.length}</span>
      </div>

      {sites.length === 0 ? (
        <p className="empty">No client sites yet. Add your first site.</p>
      ) : (
        <div className="site-list">
          {sites.map(site => (
            <div
              key={site.id}
              className={`site-item ${selected === site.id ? 'active' : ''}`}
            >
              <button
                type="button"
                className="site-select"
                onClick={() => onSelect(site.id)}
              >
                <span className="site-symbol">⌂</span>

                <span className="site-info">
                  <strong>{site.clientName}</strong>
                  <small>{site.address}</small>
                  <small>{site.peakKwp} kWp system</small>
                </span>
              </button>

              <div className="site-actions">
                <button
                  type="button"
                  title="Edit"
                  onClick={() => onEdit(site)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  title="Delete"
                  onClick={() => onDelete(site.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SiteList
