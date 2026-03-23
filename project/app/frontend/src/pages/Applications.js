import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, ExternalLink, Clock } from 'lucide-react';
import { getApplications } from '../api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await getApplications();
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-700',
      'Under Review': 'bg-yellow-100 text-yellow-700',
      'Interview Scheduled': 'bg-purple-100 text-purple-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Selected': 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="applications-page">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">My Applications</h1>
        <p className="text-slate-600 text-lg">Track your job applications</p>
      </div>

      {applications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white rounded-xl border border-slate-200"
          data-testid="no-applications"
        >
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h3>
          <p className="text-slate-600">Start applying to jobs to see them here</p>
        </motion.div>
      ) : (
        <div className="space-y-4" data-testid="applications-list">
          {applications.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              data-testid={`application-${idx}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900">{app.job_title}</h3>
                    <Badge className={getStatusColor(app.status)} data-testid={`application-status-${idx}`}>
                      {app.status}
                    </Badge>
                  </div>
                  
                  <p className="text-lg text-slate-700 mb-4">{app.company}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Applied {new Date(app.applied_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={app.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  data-testid={`view-application-${idx}`}
                >
                  <span>View Posting</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};