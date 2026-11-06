
type DashboardHeaderProps = {
  user: string
  onLogout: () => void
}

function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-icon">☀</span>
        <span>Solar Advisor</span>
      </div>

      <div className="user-info">
        <span>{user}</span>
        <button className="logout" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader
