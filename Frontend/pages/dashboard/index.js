import Head from 'next/head';
import nookies from 'nookies';
import DashboardComponent from '../../src/components/dashboard/DashboardComponent';

const Dashboard = ({ user }) => {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <DashboardComponent user={user} />
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