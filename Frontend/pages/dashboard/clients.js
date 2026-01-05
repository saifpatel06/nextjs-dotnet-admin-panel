import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ClientsComponent from '../../src/components/dashboard/ClientsComponent';

export default function ClientsPage({ initialClients }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth/login');
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  if (!authenticated) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Clients</title>
      </Head>
      <ClientsComponent initialClients={initialClients} />
    </>
  );
}

export async function getServerSideProps() {
  try {
    const response = await fetch('http://localhost:5085/api/Clients');
    const result = await response.json();
    return { 
      props: { 
        initialClients: result.success ? result.data : [] 
      } 
    };
  } catch (error) {
    console.error("Server Fetch Error:", error);
    return { props: { initialClients: [] } };
  }
}