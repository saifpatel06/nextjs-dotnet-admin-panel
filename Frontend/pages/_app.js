import 'bootstrap/dist/css/bootstrap.min.css';
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

// Remove "type" imports and the ": AppProps" type definition
const App = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default App;