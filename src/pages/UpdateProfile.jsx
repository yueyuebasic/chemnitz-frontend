import React, { useState, useEffect } from 'react';

const UpdateProfile = () => {
  const [userData, setUserData] = useState({ username: '', email: '', password: '********' });
  const [editField, setEditField] = useState(null);
  const [newValues, setNewValues] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData({
        username: storedUser.username,
        email: storedUser.email,
        password: '********',
      });
    }
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleEdit = (field) => {
    setEditField(field);
    setNewValues((prev) => ({ ...prev, [field]: userData[field] }));
  };

  const handleChange = (e) => {
    setNewValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newValues),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Update failed');
        setMessageType('error');
        return;
      }

      setUserData({
        ...userData,
        ...newValues,
      });

      const storedUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...storedUser, ...newValues };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage('Profile updated successfully');
      setMessageType('success');
      setEditField(null);
      setNewValues({});
    } catch (error) {
      console.error(error);
      setMessage('Server error, please try again');
      setMessageType('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Update Profile</h2>

      <table className="w-full border text-left">
        <thead>
          <tr className="bg-blue-300">
            <th className="text-white p-2">Field</th>
            <th className="text-white p-2">Value</th>
            <th className="text-white p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {['username', 'email', 'password'].map((field, index) => (
            <tr key={field} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
              <td className="p-2 capitalize">{field}</td>
              <td className="p-2">
                {editField === field ? (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={newValues[field]}
                    onChange={handleChange}
                    className="border rounded px-2 py-1 w-full"
                    disabled={field === 'password'}
                  />
                ) : (
                  userData[field]
                )}
              </td>
              <td className="p-2">
                {field !== 'password' && editField !== field && (
                  <button
                    onClick={() => handleEdit(field)}
                    className="text-blue-600 hover:underline"
                  >
                    Change
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {message && (
        <p
          className={`mt-2 text-sm ${
            messageType === 'success' ? 'text-blue-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}

      {editField && (
        <div className="mt-4 text-right">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateProfile;
