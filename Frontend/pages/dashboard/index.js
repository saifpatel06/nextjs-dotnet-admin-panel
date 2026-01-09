import Head from 'next/head';
import nookies from 'nookies';
import DashboardComponent from '../../src/components/dashboard/DashboardComponent';
import DashboardLayout from '../../src/components/layout/DashboardLayout';

const Dashboard = ({ user }) => {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <DashboardLayout>
        <DashboardComponent user={user} />
      </DashboardLayout>
    </>
  );
}

export async function getServerSideProps(ctx) {
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
    return {
      props: { user }, 
    };
  } catch (err) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
}

export default Dashboard;