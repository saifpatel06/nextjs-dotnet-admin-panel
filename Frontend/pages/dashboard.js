import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../src/components/Sidebar';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Check if user is logged in
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      // If no user found, redirect back to login
      router.push('/login');
    } else {
      // Set user data to state
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // If user isn't loaded yet, show nothing (prevents "flicker")
  if (!user) return null;

  // const stats = [
  //   { title: 'Total Users', value: '2,543', icon: '👥', color: 'primary' },
  //   { title: 'Revenue', value: '$45,678', icon: '💰', color: 'success' },
  //   { title: 'Orders', value: '1,234', icon: '📦', color: 'warning' },
  //   { title: 'Visitors', value: '8,456', icon: '📊', color: 'info' }
  // ];

  return (
    <div className={styles.dashboardWrapper}>
      <Sidebar isOpen={sidebarOpen} activePage="dashboard" />

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button className={styles.menuToggle} onClick={toggleSidebar}>
            ☰
          </button>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              {/* Show real Name from Database */}
              <span className={styles.userName}>{user.name}</span>
              {/* Show real Initial */}
              <div className={styles.userAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <div className="row mb-4">
            {/* {stats.map((stat, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-3 mb-3 mb-lg-0">
                <div className={`card ${styles.statCard}`}>
                  <div className="card-body">
                    <div className={styles.statHeader}>
                      <span className={styles.statIcon}>{stat.icon}</span>
                      <span className={`badge bg-${stat.color} ${styles.statBadge}`}>
                        +12%
                      </span>
                    </div>
                    <h3 className={styles.statValue}>{stat.value}</h3>
                    <p className={styles.statTitle}>{stat.title}</p>
                  </div>
                </div>
              </div>
            ))} */}
          </div>
          {/* You could also add a "Welcome" message here */}
          <div className="alert alert-light border shadow-sm">
            Welcome back, <strong>{user.role}</strong>! You logged in as {user.email}.
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;