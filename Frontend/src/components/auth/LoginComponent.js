import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../styles/Login.module.css'; 
import Link from 'next/link';

const LoginComponent = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5085/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.data));
        // Redirect to the dashboard folder
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid login credentials');
      }
    } catch (err) {
      setError('Server connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className="container">
        <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="col-12 col-md-6 col-lg-4">
            <div className={`card shadow-lg ${styles.loginCard}`}>
              <div className="card-body p-4">
                <h2 className={`card-title text-center mb-4 ${styles.loginTitle}`}>Login</h2>
                
                {error && <div className="alert alert-danger py-2 small">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email address</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 btn-lg shadow-sm" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Authenticating...
                      </>
                    ) : 'Sign In'}
                  </button>
                </form>

                <div className="text-center mt-4 border-top pt-3">
                  <p className="text-muted small mb-2">
                    Testing: <strong>test@test.com</strong> / <strong>Test@123</strong>
                  </p>
                  <p className="mb-0 small">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register" className="text-decoration-none fw-bold">Register here</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;