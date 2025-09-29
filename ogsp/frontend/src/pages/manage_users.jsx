import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManageUsers() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Edit user states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        mno: '',
        role: ''
    });

    // Delete user states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (!token || !userData) {
            navigate("/login");
            return;
        }
        
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== "admin") {
            navigate("/dashboard");
            return;
        }
        
        setUser(parsedUser);
        fetchUsers();
    }, [navigate]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const url = searchTerm 
                ? `http://localhost:5000/api/admin/users?search=${encodeURIComponent(searchTerm)}`
                : 'http://localhost:5000/api/admin/users';
                
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setUsers(response.data.users || []);
                setError('');
            } else {
                setError('Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditForm({
            username: user.username,
            email: user.email,
            mno: user.mno || '',
            role: user.role
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/admin/users/${editingUser._id}`, 
                editForm,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSuccess('User updated successfully');
                setShowEditModal(false);
                setEditingUser(null);
                fetchUsers();
            } else {
                setError('Failed to update user');
            }
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:5000/api/admin/users/${deletingUser._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setSuccess('User deleted successfully');
                setShowDeleteModal(false);
                setDeletingUser(null);
                fetchUsers();
            } else {
                setError('Failed to delete user');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleSearchClear = () => {
        setSearchTerm('');
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };



    // Filter users based on search term and include all users (admin and regular)
    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.mno?.toLowerCase().includes(searchLower) ||
            user.role?.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <Layout user={user} title="Manage Users">
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

                {success && (
                    <div className="alert alert-success" role="alert">
                        {success}
                    </div>
                )}

                {/* Search Bar */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control pe-5"
                                        placeholder="Search users by username, email, mobile, or role..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0"
                                            onClick={handleSearchClear}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="fas fa-users text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h5 className="text-muted">
                            {searchTerm ? 'No matching users found' : 'No users found'}
                        </h5>
                        <p className="text-muted">
                            {searchTerm 
                                ? `No users match your search "${searchTerm}". Try adjusting your search terms.`
                                : 'There are no users in the system yet.'
                            }
                        </p>
                        {searchTerm && (
                            <button className="btn btn-outline-primary" onClick={handleSearchClear}>
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td className="fw-medium">{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.mno || 'N/A'}</td>
                                            <td>
                                                <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-outline-primary btn-sm me-2"
                                                    onClick={() => handleEditUser(user)}
                                                    title="Edit User"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => {
                                                        setDeletingUser(user);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    title="Delete User"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                <div className={`modal fade ${showEditModal ? 'show d-block' : ''}`} style={{ backgroundColor: showEditModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit User</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <form onSubmit={handleUpdateUser}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Username</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={editForm.username}
                                                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Mobile</label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    value={editForm.mno}
                                                    onChange={(e) => setEditForm({...editForm, mno: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Role</label>
                                                <select
                                                    className="form-select"
                                                    value={editForm.role}
                                                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                                    required
                                                >
                                                    <option value="">Select Role</option>
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Update User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <div className={`modal fade ${showDeleteModal ? 'show d-block' : ''}`} style={{ backgroundColor: showDeleteModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete user "{deletingUser?.username}"? This action cannot be undone.
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleDeleteUser}>
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        </Layout>
    );
};