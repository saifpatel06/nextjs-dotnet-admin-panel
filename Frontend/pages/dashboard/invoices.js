import Head from 'next/head';
import nookies from 'nookies';
import InvoicesComponent from '../../src/components/dashboard/InvoicesComponent';
import DashboardLayout from '../../src/components/layout/DashboardLayout';

const InvoicesPage = ({ user, initialInvoices }) => {
  return (
    <>
      <Head>
        <title>Invoices | Admin Panel</title>
      </Head>
      <DashboardLayout>
        <InvoicesComponent user={user} initialInvoices={initialInvoices} />
      </DashboardLayout>
    </>
  );
};

export const getServerSideProps = async (ctx) => {
  const cookies = nookies.get(ctx);

  if (!cookies.user_session) {
    return {
      redirect: { destination: '/auth/login', permanent: false },
    };
  }

  try {
    const user = JSON.parse(cookies.user_session);

    const response = await fetch('http://localhost:5085/api/Invoices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
       return { redirect: { destination: '/auth/login', permanent: false } };
    }
    
    const result = await response.json();

    return {
      props: { 
        user, 
        initialInvoices: result.success ? result.data : [] 
      }
    };
  } catch (error) {
    console.error("Invoices SSR Fetch Error:", error);
    
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
};

export default InvoicesPage;