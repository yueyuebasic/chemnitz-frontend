import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DeleteAccount = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  const handleDelete = async () => {
    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('You are not logged in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/auth/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to delete account');
        setLoading(false);
        return;
      }

      setMessage('Account deleted successfully.');
      logout();


      // 延迟跳转登录页
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Delete account error:', error);
      setMessage('Server error, please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow text-center">
      <p className="mb-6 text-lg font-semibold">Are you sure you want to delete your account?</p>
      {message && (
        <p className={`mb-4 ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
      {!message && (
        <div className="flex justify-center gap-6">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-6 rounded"
          >
            Yes
          </button>
          <button
            onClick={() => navigate('/')}
            disabled={loading}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
