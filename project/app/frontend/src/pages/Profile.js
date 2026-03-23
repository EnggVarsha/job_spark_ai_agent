import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, GraduationCap, Briefcase, Award, Sparkles, Save } from 'lucide-react';
import { getProfile, updateProfile } from '../api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

export const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        mobile: response.data.mobile || '',
        education: response.data.education || '',
        skills: (response.data.skills || []).join(', '),
        experience: response.data.experience || '',
        certifications: (response.data.certifications || []).join(', '),
        interests: (response.data.interests || []).join(', ')
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(s => s),
        interests: formData.interests.split(',').map(s => s.trim()).filter(s => s)
      };
      
      await updateProfile(payload);
      toast.success('Profile updated successfully');
      setEditing(false);
      loadProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="profile-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Profile</h1>
          <p className="text-slate-600 text-lg">Manage your personal information</p>
        </div>
        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            data-testid="edit-profile-button"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Completion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
        data-testid="profile-completion-section"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-slate-900">Profile Completion</h2>
        </div>
        <div className="flex items-center gap-4">
          <Progress value={profile?.profile_completion || 0} className="flex-1" />
          <span className="text-2xl font-bold text-slate-900">{profile?.profile_completion || 0}%</span>
        </div>
        {profile?.profile_completion < 50 && (
          <p className="mt-4 text-sm text-slate-600">
            Complete at least 50% of your profile to start applying for jobs. Add your education, skills, experience, and upload your resume.
          </p>
        )}
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm"
        data-testid="profile-form"
      >
        <div className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editing ? formData.full_name : profile?.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!editing}
                  data-testid="profile-fullname-input"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  data-testid="profile-email-input"
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={editing ? formData.mobile : profile?.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  disabled={!editing}
                  data-testid="profile-mobile-input"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-orange-500" />
              Education
            </h3>
            <Input
              value={editing ? formData.education : profile?.education || ''}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              placeholder="e.g., Bachelor's in Computer Science"
              disabled={!editing}
              data-testid="profile-education-input"
            />
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Skills
            </h3>
            <Input
              value={editing ? formData.skills : (profile?.skills || []).join(', ')}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, Python, JavaScript (comma-separated)"
              disabled={!editing}
              data-testid="profile-skills-input"
            />
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-500" />
              Experience
            </h3>
            <Textarea
              value={editing ? formData.experience : profile?.experience || ''}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Describe your work experience..."
              rows={4}
              disabled={!editing}
              data-testid="profile-experience-input"
            />
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Certifications
            </h3>
            <Input
              value={editing ? formData.certifications : (profile?.certifications || []).join(', ')}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              placeholder="AWS Certified, Google Analytics (comma-separated)"
              disabled={!editing}
              data-testid="profile-certifications-input"
            />
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Interests
            </h3>
            <Input
              value={editing ? formData.interests : (profile?.interests || []).join(', ')}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              placeholder="Web Development, AI, Cloud Computing (comma-separated)"
              disabled={!editing}
              data-testid="profile-interests-input"
            />
          </div>

          {editing && (
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="save-profile-button"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => {
                  setEditing(false);
                  loadProfile();
                }}
                variant="outline"
                data-testid="cancel-edit-button"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};