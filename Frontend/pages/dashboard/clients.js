import Head from 'next/head';
import nookies from 'nookies';
import ClientsComponent from '../../src/components/dashboard/ClientsComponent';

const ClientsPage = ({ user, initialClients }) => {
  return (
    <>
      <Head>
        <title>Clients | Admin Panel</title>
      </Head>
      <ClientsComponent user={user} initialClients={initialClients} />
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

    const response = await fetch('http://localhost:5085/api/Clients');
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