import Head from 'next/head';
import nookies from 'nookies';
import InvoicesComponent from '../../src/components/dashboard/InvoicesComponent';

const InvoicesPage = ({ user, initialInvoices }) => {
  return (
    <>
      <Head>
        <title>Invoices | Admin Panel</title>
      </Head>
      {/* Pass both user and fetched invoices to the UI component */}
      <InvoicesComponent user={user} initialInvoices={initialInvoices} />
    </>
  );
};

export const getServerSideProps = async (ctx) => {
  const cookies = nookies.get(ctx);

  if (!cookies.user_session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  try {
    const user = JSON.parse(cookies.user_session);

    const res = await fetch('http://localhost:5085/api/Invoices');
    const result = await res.json();

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