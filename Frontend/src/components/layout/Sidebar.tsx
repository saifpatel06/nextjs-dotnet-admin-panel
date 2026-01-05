interface SidebarProps {
  isOpen: boolean;
  activePage: string;
}

import styles from '../../../styles/Sidebar.module.css';

const Sidebar = ({ isOpen, activePage }: SidebarProps) => {
  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Clients', icon: '👥', path: '/dashboard/clients' },
    { name: 'Invoices', icon: '📋', path: '/dashboard/invoices' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <div className={styles.sidebarHeader}>
        <h4 className={styles.sidebarTitle}>Admin Panel</h4>
      </div>
      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            className={`${styles.navItem} ${activePage === item.name.toLowerCase() ? styles.navItemActive : ''}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navText}>{item.name}</span>
          </a>
        ))}
        <a href="/login" className={styles.navItem}>
          <span className={styles.navIcon}>🚪</span>
          <span className={styles.navText}>Logout</span>
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;