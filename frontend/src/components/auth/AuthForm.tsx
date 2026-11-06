
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'

function AuthForm() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [registerMode, setRegisterMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = registerMode
        ? await authApi.register(email, password)
        : await authApi.login(email, password)

      sessionStorage.setItem('csrfToken', response.csrfToken)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="brand-icon">☀</div>

      <h1>Solar Advisor</h1>

      <p>
        {registerMode
          ? 'Create your account to get started.'
          : 'Welcome back! Please sign in to continue.'}
      </p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>

        <div className="password-field">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            minLength={12}
            autoComplete={registerMode ? 'new-password' : 'current-password'}
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                <path d="M9.9 5.2A11 11 0 0121 12a11 11 0 01-3.1 4.2" />
                <path d="M6.2 6.2A11 11 0 003 12s3 7 9 7a9.5 9.5 0 004.1-.9" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        <button
          type="submit"
          className="primary full"
          disabled={loading}
        >
          {loading
            ? 'Please wait...'
            : registerMode
              ? 'Register'
              : 'Login'}
        </button>
      </form>

      <div className="switch-auth">
        {registerMode
          ? 'Already have an account?'
          : "Don't have an account?"}

        <button
          type="button"
          onClick={() => {
            setRegisterMode((previous) => !previous)
            setShowPassword(false)
            setError('')
          }}
        >
          {registerMode ? 'Login' : 'Register'}
        </button>
      </div>
    </div>
  )
}

export default AuthForm
