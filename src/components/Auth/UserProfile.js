import React, { useState } from 'react';
import axios from 'axios';
import PremiumToggle from '../PremiumToggle';
import ProfileGoalsSection from './ProfileGoalsSection';

const UserProfile = ({ user, onLogout, onUpdateProfile, isPremium, onPremiumToggle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    preferences: user?.preferences || {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('reflectWithin_token');
      const response = await axios.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Profile updated successfully!');
      onUpdateProfile(response.data.user);
      setIsEditing(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('reflectWithin_token');
    localStorage.removeItem('reflectWithin_user');
    onLogout();
  };

  if (!user) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-light text-foreground">Profile</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-muted-foreground hover:text-foreground text-sm font-light transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-light text-muted-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-light"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-muted-foreground mb-2">
              Theme
            </label>
            <select
              name="preferences.theme"
              value={formData.preferences.theme || 'auto'}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground font-light"
            >
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="preferences.notifications"
              checked={formData.preferences.notifications || false}
              onChange={handleInputChange}
              className="h-4 w-4 text-foreground focus:ring-ring border-border rounded"
            />
            <label className="ml-2 block text-sm text-foreground font-light">
              Enable notifications
            </label>
          </div>

          {message && (
            <div className={`text-sm p-3 rounded-xl font-light ${
              message.includes('successfully') 
                ? 'text-green-600 bg-green-50' 
                : 'text-red-600 bg-red-50'
            }`}>
              {message}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-foreground text-background py-3 px-4 rounded-xl font-light hover:bg-muted-foreground disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-muted text-muted-foreground py-3 px-4 rounded-xl font-light hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground font-light">Name</span>
            <p className="text-foreground font-light">{user.name}</p>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground font-light">Email</span>
            <p className="text-foreground font-light">{user.email}</p>
          </div>

          <div>
            <span className="text-sm text-muted-foreground font-light">Member since</span>
            <p className="text-foreground font-light">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div>
            <span className="text-sm text-muted-foreground font-light">Last login</span>
            <p className="text-foreground font-light">
              {new Date(user.lastLogin).toLocaleDateString()}
            </p>
          </div>

          {/* Premium Toggle */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-light">Premium Features</span>
              <PremiumToggle isPremium={isPremium} onToggle={onPremiumToggle} />
            </div>
            <p className="text-xs text-muted-foreground font-light">
              {isPremium 
                ? "You have access to all premium features including insights dashboard and cloud storage."
                : "Upgrade to premium for insights dashboard, cloud storage, and advanced features."
              }
            </p>
          </div>

          {/* My Goals Section */}
          <ProfileGoalsSection user={user} />

          <div className="pt-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full bg-destructive text-destructive-foreground py-3 px-4 rounded-xl font-light hover:bg-destructive/90 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 