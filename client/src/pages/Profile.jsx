import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Card, Input, Button, Checkbox } from '../components/ui';
import { validateEmail, validateName } from '../utils/validators';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [emailPreferences, setEmailPreferences] = useState({
    dailyReminders: user?.emailPreferences?.dailyReminders ?? true,
    weeklyDigest: user?.emailPreferences?.weeklyDigest ?? true,
    milestoneReminders: user?.emailPreferences?.milestoneReminders ?? true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmailPreferenceChange = (name, checked) => {
    setEmailPreferences(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const newErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set a new password';
      }
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        emailPreferences,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await updateProfile(updateData);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </motion.div>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <User className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                icon={User}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={Mail}
                required
              />
            </div>
          </Card>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Lock className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Change Password</h2>
            </div>

            <div className="space-y-4">
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                error={errors.currentPassword}
                icon={Lock}
                placeholder="Enter current password"
              />

              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                icon={Lock}
                placeholder="Enter new password"
              />

              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={Lock}
                placeholder="Confirm new password"
              />
            </div>
          </Card>
        </motion.div>

        {/* Email Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Bell className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Email Notifications</h2>
            </div>

            <div className="space-y-4">
              <Checkbox
                label="Daily Reminders"
                checked={emailPreferences.dailyReminders}
                onChange={(e) => handleEmailPreferenceChange('dailyReminders', e.target.checked)}
              />

              <Checkbox
                label="Weekly Progress Digest"
                checked={emailPreferences.weeklyDigest}
                onChange={(e) => handleEmailPreferenceChange('weeklyDigest', e.target.checked)}
              />

              <Checkbox
                label="Milestone Reminders"
                checked={emailPreferences.milestoneReminders}
                onChange={(e) => handleEmailPreferenceChange('milestoneReminders', e.target.checked)}
              />
            </div>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={Save}
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default Profile;
