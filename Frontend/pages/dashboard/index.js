import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardComponent from '../../src/components/dashboard/DashboardComponent';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      // Updated path to match your new /auth/ folder structure
      router.push('/auth/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  // Prevent flicker while checking auth
  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | Invoice Manager</title>
      </Head>
      <DashboardComponent user={user} />
    </>
  );
}