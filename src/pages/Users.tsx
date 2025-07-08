import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Plus, Trash2, Lock, Shield, UserPlus, Package } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

const Users: React.FC = () => {
  const { user } = useAuth();
  const { userBoxes, discoveredBoxes, addDiscoveredBox } = useSensor();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddBox, setShowAddBox] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newBoxId, setNewBoxId] = useState('');
  const [newBoxName, setNewBoxName] = useState('');
  const [newBoxLocation, setNewBoxLocation] = useState('');
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editBoxes, setEditBoxes] = useState<string[]>([]);
  const [users, setUsers] = useState(() => {
    const userManagement = (window as any).userManagement;
    return userManagement ? userManagement.getUsers() : [];
  });

  const handleAddUser = () => {
    if (newUsername.trim() && newPassword.trim() && selectedBoxes.length > 0) {
      const userManagement = (window as any).userManagement;
      if (userManagement) {
        const newUser = userManagement.addUser(newUsername.trim(), newPassword.trim(), selectedBoxes);
        setUsers(userManagement.getUsers());
        setNewUsername('');
        setNewPassword('');
        setSelectedBoxes([]);
        setShowAddUser(false);
      }
    }
  };

  const handleAddBox = () => {
    if (newBoxId.trim() && newBoxName.trim() && newBoxLocation.trim()) {
      addDiscoveredBox(newBoxId.trim(), newBoxName.trim(), newBoxLocation.trim());
      setNewBoxId('');
      setNewBoxName('');
      setNewBoxLocation('');
      setShowAddBox(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const userManagement = (window as any).userManagement;
      if (userManagement) {
        const success = userManagement.deleteUser(userId);
        if (success) {
          setUsers(userManagement.getUsers());
        } else {
          alert('Cannot delete this user. Owner accounts cannot be deleted.');
        }
      }
    }
  };
  
  const handleEditUserBoxes = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setEditingUser(userId);
      setEditBoxes(userToEdit.assignedBoxes || []);
    }
  };
  
  const handleSaveUserBoxes = () => {
    const userManagement = (window as any).userManagement;
    if (userManagement && editingUser) {
      userManagement.updateUserBoxes(editingUser, editBoxes);
      setUsers(userManagement.getUsers());
      setEditingUser(null);
      setEditBoxes([]);
    }
  };

  if (user?.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Lock className="h-24 w-24 text-gray-400 mx-auto mb-8" />
          <h1 className="text-6xl font-bold text-gray-400 mb-4">LOCKED</h1>
          <p className="text-xl text-gray-600 mb-8">Access Denied</p>
          <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-8 max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Polychaeta Owner Access Required</h2>
            <p className="text-gray-600 mb-4">
              This page is restricted to system owners only. Regular users do not have permission to access user management features.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Protected by role-based access control</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Polychaeta User Management</h1>
        <p className="text-gray-600">Manage Polychaeta system users and box assignments</p>
      </div>
      
      {/* Discovered Boxes */}
      <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Discovered Sensor Boxes</h3>
        {discoveredBoxes.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No sensor boxes discovered yet</p>
            <p className="text-sm text-gray-500">Boxes will appear here when ESP32 devices connect via MQTT</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoveredBoxes.map((box) => (
              <div key={box.id} className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Package className="h-5 w-5 text-sky-600" />
                  <h4 className="font-medium text-gray-900">{box.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-1">ID: {box.id}</p>
                <p className="text-sm text-gray-600 mb-2">Location: {box.location}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  box.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {box.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* MQTT Box Discovery Info */}
      <div className="bg-sky-50 rounded-xl border border-sky-200 p-6">
        <h3 className="text-lg font-semibold text-sky-900 mb-2">MQTT Auto-Discovery</h3>
        <p className="text-sky-700 text-sm">New ESP32 sensor boxes will be automatically discovered when they connect via MQTT. You can also manually add boxes below.</p>
      </div>

      {/* Add User Section */}
      <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Polychaeta User</h3>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => setShowAddBox(!showAddBox)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Package className="h-4 w-4" />
            <span>Add Box</span>
          </button>
        </div>

        {showAddUser && (
          <div className="border-t border-sky-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Assign Monitoring Boxes
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {userBoxes.map(box => (
                  <label key={box.id} className="flex items-center space-x-2 p-3 border border-sky-200 rounded-lg hover:bg-sky-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBoxes.includes(box.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBoxes([...selectedBoxes, box.id]);
                        } else {
                          setSelectedBoxes(selectedBoxes.filter(id => id !== box.id));
                        }
                      }}
                      className="rounded border-sky-300 text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{box.name}</div>
                      <div className="text-sm text-gray-600">{box.location}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create User</span>
              </button>
            </div>
          </div>
        )}
        
        {showAddBox && (
          <div className="border-t border-sky-100 pt-4 mt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Sensor Box</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Box ID</label>
                <input
                  type="text"
                  value={newBoxId}
                  onChange={(e) => setNewBoxId(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="e.g., box-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Box Name</label>
                <input
                  type="text"
                  value={newBoxName}
                  onChange={(e) => setNewBoxName(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="e.g., Coastal Monitor A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newBoxLocation}
                  onChange={(e) => setNewBoxLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="e.g., North Coast"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowAddBox(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBox}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Package className="h-4 w-4" />
                <span>Add Box</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Polychaeta System Users</h3>
        
        {/* Access Control Notice */}
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-medium text-amber-800 mb-2">🔒 Access Control Policy</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• <strong>Owners</strong>: Can access all sensor boxes and manage users</li>
            <li>• <strong>Users</strong>: Can only access their specifically assigned boxes</li>
            <li>• <strong>Data Isolation</strong>: Users cannot see data from unassigned boxes</li>
            <li>• <strong>Box Assignment</strong>: Must be explicitly assigned by owner</li>
          </ul>
        </div>
        
        <div className="space-y-4">
          {users.map((userItem: any) => (
            <div
              key={userItem.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <User className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{userItem.username}</h4>
                  <p className="text-sm text-gray-600">
                    Role: {userItem.role === 'owner' ? 'Polychaeta Owner' : 'Marine Researcher'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(userItem.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    {userItem.assignedBoxes && userItem.assignedBoxes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500 mr-1">Assigned Boxes:</span>
                        {userItem.assignedBoxes.map((boxId: string) => (
                          <span key={boxId} className="px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded-full">
                            {boxId}
                          </span>
                        ))}
                      </div>
                    ) : userItem.role !== 'owner' ? (
                      <span className="text-xs text-red-600 font-medium">⚠️ No boxes assigned</span>
                    ) : (
                      <span className="text-xs text-purple-600">👑 Access to all boxes</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  userItem.role === 'owner' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userItem.role === 'owner' ? 'Owner' : 'Researcher'}
                </span>
                {userItem.role !== 'owner' && (
                  <>
                    <button
                      onClick={() => handleEditUserBoxes(userItem.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit box assignments"
                    >
                      <Package className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(userItem.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Edit Box Assignment Modal */}
            {editingUser === userItem.id && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">Edit Box Assignments for {userItem.username}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {discoveredBoxes.map(box => (
                    <label key={box.id} className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editBoxes.includes(box.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditBoxes([...editBoxes, box.id]);
                          } else {
                            setEditBoxes(editBoxes.filter(id => id !== box.id));
                          }
                        }}
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{box.name}</div>
                        <div className="text-sm text-gray-600">{box.location}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setEditBoxes([]);
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveUserBoxes}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          ))}
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-sky-100 rounded-lg">
              <User className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Total Users</h4>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">System Owners</h4>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u: any) => u.role === 'owner').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Marine Researchers</h4>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u: any) => u.role === 'user').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;