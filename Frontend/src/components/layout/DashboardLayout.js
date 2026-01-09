import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import styles from '../../../styles/Layout.module.css';

const DashboardLayout = ({ children, user, activePage }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(true); // Open on desktop
      } else {
        setIsOpen(false); // Closed on mobile
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} activePage={activePage} />
      
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