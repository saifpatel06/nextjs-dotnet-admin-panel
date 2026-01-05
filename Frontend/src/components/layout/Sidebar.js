import Link from 'next/link';
import { useRouter } from 'next/router';
import { destroyCookie } from 'nookies';
import styles from '../../../styles/Sidebar.module.css';

const Sidebar = ({ isOpen, activePage }) => {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Clients', icon: '👥', path: '/dashboard/clients' },
    { name: 'Invoices', icon: '📋', path: '/dashboard/invoices' },
  ];

  const handleLogout = (e) => {
    e.preventDefault(); // Prevent default link behavior
    
    // 1. Clear the cookie
    destroyCookie(null, 'user_session', { path: '/' });
    
    // 2. Redirect to login
    router.push('/auth/login');
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <div className={styles.sidebarHeader}>
        <h4 className={styles.sidebarTitle}>Admin Panel</h4>
      </div>
      
      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`${styles.navItem} ${
              activePage === item.name.toLowerCase() ? styles.navItemActive : ''
            }`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navText}>{item.name}</span>
          </Link>
        ))}

        <hr className="my-3 opacity-25" />

        <button 
          onClick={handleLogout} 
          className={`${styles.navItem} border-0 bg-transparent w-100 text-start`}
          style={{ cursor: 'pointer' }}
        >
          <span className={styles.navIcon}>🚪</span>
          <span className={styles.navText}>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;