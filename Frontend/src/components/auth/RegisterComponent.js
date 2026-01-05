import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../styles/Register.module.css';
import Link from 'next/link';

const RegisterComponent = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false || formData.password !== formData.confirmPassword) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5085/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'Registration successful!');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setValidated(false);
        // Redirect to our new nested login route
        setTimeout(() => { router.push('/auth/login'); }, 2000);
      } else {
        setError(data.errors?.length > 0 ? data.errors.join(', ') : data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Unable to connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword;

  return (
    <div className={styles.registerContainer}>
      <div className="container">
        <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="col-12 col-md-8 col-lg-5">
            <div className={`card shadow-lg ${styles.registerCard}`}>
              <div className="card-body p-4">
                <h2 className={`card-title text-center mb-4 ${styles.registerTitle}`}>Create Account</h2>

                {success && <div className="alert alert-success small"><strong>Success!</strong> {success}</div>}
                {error && <div className="alert alert-danger small"><strong>Error!</strong> {error}</div>}

                <form onSubmit={handleSubmit} noValidate className={validated ? 'was-validated' : ''}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Full Name</label>
                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required disabled={loading} />
                    <div className="invalid-feedback">Please provide your name.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email Address</label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required disabled={loading} />
                    <div className="invalid-feedback">Please provide a valid email.</div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Password</label>
                      <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} minLength={6} required disabled={loading} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Confirm</label>
                      <input type="password" className={`form-control ${validated && !passwordsMatch ? 'is-invalid' : ''}`} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required disabled={loading} />
                    </div>
                  </div>

                  <div className="mb-4 form-check">
                    <input type="checkbox" className="form-check-input" id="terms" required disabled={loading} />
                    <label className="form-check-label small" htmlFor="terms">I agree to the Terms & Conditions</label>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 btn-lg shadow-sm" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</> : 'Register'}
                  </button>
                </form>

                <div className="text-center mt-4 border-top pt-3">
                  <span className="small text-muted">Already have an account? </span>
                  <Link href="/auth/login" className="text-decoration-none fw-bold small">Login here</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterComponent;