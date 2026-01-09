import Link from 'next/link';
import { useRouter } from 'next/router';
import { destroyCookie } from 'nookies';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGauge, faFileInvoice, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../styles/Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: faGauge,
      path: '/dashboard',
      id: 'dashboard'
    },
    { 
      name: 'Barbers', 
      icon: faUser,
      path: '/dashboard/barbers',
      id: 'barber'
    },
    { 
      name: 'Clients', 
      icon: faUser,
      path: '/dashboard/clients',
      id: 'clients'
    },

    { 
      name: 'Invoices', 
      icon: faFileInvoice,
      path: '/dashboard/invoices',
      id: 'invoices'
    },
  ];

  const handleLogout = (e) => {
    e.preventDefault(); 
    destroyCookie(null, 'user_session', { path: '/' });
    router.push('/auth/login');
  };

  // Check if route is active
  const isActiveRoute = (path) => {
    return router.pathname === path;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className={styles.backdrop} 
          onClick={toggleSidebar}
        />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        {/* Logo Text */}
        <div className={styles.logo}>
          <h2 className={styles.logoText}>Admin Panel</h2>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`${styles.navItem} ${
                isActiveRoute(item.path) ? styles.active : ''
              }`}
              onClick={() => {
                // Close sidebar on mobile when clicking a link
                if (window.innerWidth <= 768) {
                  toggleSidebar();
                }
              }}
            >
              <span className={styles.iconWrapper}>
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <span className={styles.navLabel}>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className={styles.bottomSection}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <span className={styles.iconWrapper}>
              <FontAwesomeIcon icon={faRightFromBracket} />
            </span>
            <span className={styles.navLabel}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;