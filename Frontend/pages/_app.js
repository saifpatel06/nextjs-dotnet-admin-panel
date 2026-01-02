import 'bootstrap/dist/css/bootstrap.min.css';

// Remove "type" imports and the ": AppProps" type definition
const App = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default App;