import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Briefcase, BookOpen, Target } from 'lucide-react';
import { getJobs, getProfile } from '../api';
import { toast } from 'sonner';
import { JobCard } from '../components/JobCard';
import { Progress } from '@/components/ui/progress';

export const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, profileRes] = await Promise.all([getJobs(), getProfile()]);
      setJobs(jobsRes.data.slice(0, 6));
      setProfile(profileRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const categorizeJobs = () => {
    return {
      jobs: jobs.filter(j => j.category === 'job').slice(0, 3),
      internships: jobs.filter(j => j.category === 'internship').slice(0, 2),
      courses: jobs.filter(j => j.category === 'course').slice(0, 2)
    };
  };

  const { jobs: recommendedJobs, internships, courses } = categorizeJobs();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-home">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="home-page">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white"
        data-testid="welcome-banner"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!</h1>
            <p className="text-orange-100 text-lg">Let's find your dream opportunity today</p>
          </div>
          <Sparkles className="w-16 h-16 opacity-50" />
        </div>

        {/* Profile Completion */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Profile Completion</span>
            <span className="font-bold">{profile?.profile_completion || 0}%</span>
          </div>
          <Progress value={profile?.profile_completion || 0} className="h-2 bg-white/20" />
          {profile?.profile_completion < 50 && (
            <p className="mt-2 text-sm text-orange-100">
              Complete at least 50% of your profile to apply for jobs
            </p>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          data-testid="stat-jobs"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Briefcase className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Recommended Jobs</p>
              <p className="text-2xl font-bold text-slate-900">{jobs.filter(j => j.category === 'job').length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          data-testid="stat-internships"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Internships</p>
              <p className="text-2xl font-bold text-slate-900">{jobs.filter(j => j.category === 'internship').length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
          data-testid="stat-courses"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Courses</p>
              <p className="text-2xl font-bold text-slate-900">{jobs.filter(j => j.category === 'course').length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recommended Jobs */}
      {recommendedJobs.length > 0 && (
        <div data-testid="recommended-jobs-section">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-slate-900">Recommended Jobs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Internships */}
      {internships.length > 0 && (
        <div data-testid="internships-section">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-slate-900">Internship Opportunities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internships.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Courses */}
      {courses.length > 0 && (
        <div data-testid="courses-section">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold text-slate-900">Recommended Courses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};