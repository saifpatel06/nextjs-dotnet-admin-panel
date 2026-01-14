import Head from 'next/head';
import nookies from 'nookies';
import AppointmentsComponent from '../../src/components/dashboard/AppointmentsComponent.js';
import DashboardLayout from '../../src/components/layout/DashboardLayout.js'

const Appointments = ({ user, initialAppointments }) => {
  return (
    <>
      <Head>
        <title>Barbers | Admin Panel</title>
      </Head>
      <DashboardLayout>
        <AppointmentsComponent user={user} initialAppointments={initialAppointments} />
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

    const response = await fetch('http://localhost:5085/api/Appointments', {
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
    console.log("result", result);
    
    return {
      props: { 
        user, 
        initialAppointments: result.success ? result.data : [] 
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

export default Appointments;