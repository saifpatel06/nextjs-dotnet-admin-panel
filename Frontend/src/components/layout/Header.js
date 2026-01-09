import { useState, useEffect } from 'react';
import { parseCookies } from 'nookies';
import styles from '../../../styles/Header.module.css';

const Header = ({ toggleSidebar }) => {

  const [userData, setUserData] = useState();

  useEffect(() => {
    const cookies = parseCookies();
    
    if (cookies.user_session) {
      try {
        const parsedUser = JSON.parse(cookies.user_session);
        console.log("parsedUser", parsedUser);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Failed to parse user session cookie:", error);
      }
    }
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.toggleBtn} onClick={toggleSidebar}>
          ☰
        </button>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.profileSection}>
          <div className={styles.userText}>
            <p className={styles.userName}>{userData?.name || 'Admin User'}</p>
            <p className={styles.userRole}>{userData?.role || 'Administrator'}</p>
          </div>
          <div className={styles.avatar}>
            {userData?.name ? userData.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;