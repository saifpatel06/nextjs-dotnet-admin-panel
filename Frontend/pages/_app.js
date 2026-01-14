import 'bootstrap/dist/css/bootstrap.min.css';
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { Toaster } from 'react-hot-toast';
config.autoAddCss = false

// Remove "type" imports and the ": AppProps" type definition
const App = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }} 
        />
    </>
  )
};

export default App;