import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import styles from '../../../styles/Layout.module.css';

const DashboardLayout = ({ children, user, activePage }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar gets the isOpen state */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} activePage={activePage} />
      
      {/* Content area shifts only on desktop when sidebar is open */}
      <div className={`${styles.mainWrapper} ${isOpen ? styles.shifted : ''}`}>
        <Header user={user} activePage={activePage} toggleSidebar={toggleSidebar} />
        
        <main className={styles.pageContent}>
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;