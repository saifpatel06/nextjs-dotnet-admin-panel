import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Register.module.css';
import Link from 'next/link';

const Register = () => {
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
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
      // Call backend API
      const response = await fetch('http://localhost:5085/api/Auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success
        setSuccess(data.message || 'Registration successful!');
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setValidated(false);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        // Error from backend
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join(', '));
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Unable to connect to server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword;

  return (
    <div className={styles.registerContainer}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className={`card ${styles.registerCard}`}>
              <div className="card-body">
                <h2 className={`card-title text-center mb-4 ${styles.registerTitle}`}>
                  Create Account
                </h2>

                {/* Success Alert */}
                {success && (
                  <div className="alert alert-success" role="alert">
                    <strong>Success!</strong> {success} Redirecting to login...
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <strong>Error!</strong> {error}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className={validated ? 'was-validated' : ''}
                >
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <div className="invalid-feedback">
                      Please provide your name.
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <div className="invalid-feedback">
                      Please provide a valid email.
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      minLength={6}
                      required
                      disabled={loading}
                    />
                    <div className="invalid-feedback">
                      Password must be at least 6 characters.
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className={`form-control ${validated && !passwordsMatch ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <div className="invalid-feedback">
                      Passwords do not match.
                    </div>
                  </div>
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="terms"
                      required
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="terms">
                      I agree to the Terms and Conditions
                    </label>
                    <div className="invalid-feedback">
                      You must agree before submitting.
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registering...
                      </>
                    ) : (
                      'Register'
                    )}
                  </button>
                </form>
                <div className={`text-center mt-3 ${styles.loginLink}`}>
                  <span>Already have an account? </span>
                  <Link href="/login">Login here</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;