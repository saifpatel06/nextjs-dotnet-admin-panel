import Head from 'next/head';
import RegisterComponent from '../../src/components/auth/RegisterComponent';

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Register</title>
      </Head>

      <main>
        <RegisterComponent />
      </main>
    </>
  );
}