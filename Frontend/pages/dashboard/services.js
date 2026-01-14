import Head from 'next/head';
import nookies from 'nookies';
import ServicesComponent from '../../src/components/dashboard/ServicesComponent.js';
import DashboardLayout from '../../src/components/layout/DashboardLayout'

const Services = ({ user, initialServices }) => {
  return (
    <>
      <Head>
        <title>Services | Admin Panel</title>
      </Head>
      <DashboardLayout>
        <ServicesComponent user={user} initialServices={initialServices} />
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

    const response = await fetch('http://localhost:5085/api/Services', {
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
        initialServices: result.success ? result.data : [] 
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

export default Services;