import { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import styles from '../../../styles/Dashboard.module.css';

const DashboardComponent = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const stats = [
    { title: 'Total Invoices', value: '128', icon: '📄', color: 'primary' },
    { title: 'Revenue', value: '$45,678', icon: '💰', color: 'success' },
    { title: 'Pending', value: '12', icon: '⏳', color: 'warning' },
    { title: 'Active Clients', value: '84', icon: '👥', color: 'info' }
  ];

  return (
    <div className={styles.dashboardWrapper}>
      <Sidebar isOpen={sidebarOpen} activePage="dashboard" />

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button className={styles.menuToggle} onClick={toggleSidebar}>☰</button>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
          
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <div className={styles.userAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <div className="row mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-3 mb-3">
                <div className={`card shadow-sm border-0 ${styles.statCard}`}>
                  <div className="card-body">
                    <div className={styles.statHeader}>
                      <span className={styles.statIcon}>{stat.icon}</span>
                      <span className={`badge bg-${stat.color} bg-opacity-10 text-${stat.color}`}>
                        Active
                      </span>
                    </div>
                    <h3 className={styles.statValue}>{stat.value}</h3>
                    <p className={styles.statTitle}>{stat.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="alert alert-white border shadow-sm d-flex align-items-center bg-white p-4">
            <div className="me-3 fs-2">👋</div>
            <div>
              <h5 className="mb-1">Welcome back, {user.name}!</h5>
              <p className="text-muted mb-0 small">
                You are logged in as <strong>{user.role}</strong> ({user.email}). 
                Everything looks good with your invoices today.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardComponent;