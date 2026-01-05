import Head from 'next/head';
import LoginComponent from '../../src/components/auth/LoginComponent';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login to access your dashboard" />
      </Head>

      <main>
        <LoginComponent />
      </main>
    </>
  );
}