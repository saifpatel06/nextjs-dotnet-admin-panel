import Head from 'next/head';
import nookies from 'nookies';
import ClientsComponent from '../../src/components/dashboard/ClientsComponent';
import DashboardLayout from '../../src/components/layout/DashboardLayout'

const ClientsPage = ({ user, initialClients }) => {
  return (
    <>
      <Head>
        <title>Clients | Admin Panel</title>
      </Head>
      <DashboardLayout>
        <ClientsComponent user={user} initialClients={initialClients} />
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

    const response = await fetch('http://localhost:5085/api/Clients', {
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
        initialClients: result.success ? result.data : [] 
      }
    };
  } catch (error) {
    console.error("Server Fetch Error:", error);
    
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
};

export default ClientsPage;