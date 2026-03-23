import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Phone, GraduationCap, Briefcase } from 'lucide-react';
import { register } from '../api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    mobile: '',
    education: '',
    skills: '',
    experience: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };
      
      const response = await register(payload);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user_id);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex auth-background" data-testid="register-page">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-slate-900">JobSpark</h1>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Create your account</h2>
            <p className="text-slate-600">Start your career journey with AI-powered guidance</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  data-testid="register-fullname-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="register-email-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="register-password-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+1234567890"
                  className="pl-10"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                  data-testid="register-mobile-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="education">Education</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="education"
                  type="text"
                  placeholder="Bachelor's in Computer Science"
                  className="pl-10"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  data-testid="register-education-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                type="text"
                placeholder="React, Python, JavaScript"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                data-testid="register-skills-input"
              />
            </div>

            <div>
              <Label htmlFor="experience">Experience (Optional)</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Textarea
                  id="experience"
                  placeholder="2 years as Full Stack Developer at..."
                  className="pl-10"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  data-testid="register-experience-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={loading}
              data-testid="register-submit-button"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium" data-testid="login-link">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
          <img
            src="https://images.unsplash.com/photo-1610641820147-fd3e3043f2f8?w=1200&q=80"
            alt="Career growth"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 flex items-center justify-center p-12 text-white">
          <div className="max-w-md">
            <h3 className="text-4xl font-bold mb-4">Launch Your Career with AI</h3>
            <p className="text-lg text-slate-300">
              Get personalized job recommendations, build ATS-friendly resumes, and receive AI-powered career guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};