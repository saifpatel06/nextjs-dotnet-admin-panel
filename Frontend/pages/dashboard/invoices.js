import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InvoicesComponent from '../../src/components/dashboard/InvoicesComponent';

export default function InvoicesPage({ initialInvoices }) {
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
        <title>Invoices</title>
      </Head>
      <InvoicesComponent initialInvoices={initialInvoices} />
    </>
  );
}

export async function getServerSideProps() {
  try {
    const res = await fetch('http://localhost:5085/api/Invoices');
    const result = await res.json();
    return { props: { initialInvoices: result.success ? result.data : [] } };
  } catch {
    return { props: { initialInvoices: [] } };
  }
}