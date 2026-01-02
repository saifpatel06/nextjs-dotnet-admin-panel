import { useState } from 'react';
import Sidebar from '../src/components/Sidebar';
import styles from '../styles/Users.module.css';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  role: string;
  joined: string;
}

const Users = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Admin', joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', role: 'User', joined: '2024-01-14' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive', role: 'User', joined: '2024-01-13' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Active', role: 'Manager', joined: '2024-01-12' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'Active', role: 'User', joined: '2024-01-11' },
    { id: 6, name: 'Diana Martinez', email: 'diana@example.com', status: 'Inactive', role: 'User', joined: '2024-01-10' },
    { id: 7, name: 'Edward Taylor', email: 'edward@example.com', status: 'Active', role: 'Admin', joined: '2024-01-09' },
    { id: 8, name: 'Fiona Anderson', email: 'fiona@example.com', status: 'Active', role: 'Manager', joined: '2024-01-08' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'Active' as 'Active' | 'Inactive',
    role: 'User',
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      status: 'Active',
      role: 'User',
    });
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (userId: number) => {
    setDeletingUserId(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingUserId) {
      setUsers(users.filter(user => user.id !== deletingUserId));
      setShowDeleteModal(false);
      setDeletingUserId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      setUsers(users.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData }
          : user
      ));
    } else {
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...formData,
        joined: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
    }

    setShowModal(false);
    setEditingUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.usersWrapper}>
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} activePage="users" />

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <button
            className={styles.menuToggle}
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className={styles.pageTitle}>Users Management</h1>
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Admin User</span>
              <div className={styles.userAvatar}>A</div>
            </div>
          </div>
        </header>

        {/* Users Content */}
        <main className={styles.content}>
          {/* Action Bar */}
          <div className={styles.actionBar}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                className={`form-control ${styles.searchInput}`}
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button
              className={`btn btn-primary ${styles.addButton}`}
              onClick={handleAddUser}
            >
              <span className={styles.buttonIcon}>+</span>
              Add User
            </button>
          </div>

          {/* Users Table */}
          <div className={`card ${styles.tableCard}`}>
            <div className="card-body">
              <div className={styles.tableResponsive}>
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.userCellAvatar}>
                                {user.name.charAt(0)}
                              </div>
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${styles.roleBadge} ${styles[`role${user.role}`]}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                user.status === 'Active'
                                  ? 'bg-success'
                                  : 'bg-secondary'
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td>{user.joined}</td>
                          <td>
                            <button
                              className={`btn btn-sm btn-primary ${styles.actionBtn}`}
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </button>
                            <button
                              className={`btn btn-sm btn-danger ${styles.actionBtn}`}
                              onClick={() => handleDeleteClick(user.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className={styles.noResults}>
                          No users found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className={styles.tableFooter}>
                <span className={styles.resultsInfo}>
                  Showing {filteredUsers.length} of {users.length} users
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <>
          <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}></div>
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h5 className={styles.modalTitle}>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h5>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">
                      Role
                    </label>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div className={styles.modalBackdrop} onClick={() => setShowDeleteModal(false)}></div>
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h5 className={styles.modalTitle}>Confirm Delete</h5>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowDeleteModal(false)}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Users;