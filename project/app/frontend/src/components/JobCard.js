import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, Clock, ExternalLink } from 'lucide-react';
import { createApplication } from '../api';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const JobCard = ({ job }) => {
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    try {
      const response = await createApplication({ job_id: job.id });
      toast.success('Application submitted! Redirecting...');
      
      setTimeout(() => {
        window.open(response.data.redirect_url, '_blank');
      }, 1000);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to submit application');
      }
    } finally {
      setApplying(false);
    }
  };

  const getCategoryColor = () => {
    const colors = {
      job: 'bg-blue-100 text-blue-700',
      internship: 'bg-purple-100 text-purple-700',
      course: 'bg-green-100 text-green-700'
    };
    return colors[job.category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm card-hover"
      data-testid="job-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Badge className={getCategoryColor()}>{job.category}</Badge>
          <h3 className="text-lg font-semibold text-slate-900 mt-2 mb-1" data-testid="job-title">{job.title}</h3>
          <p className="text-slate-700 font-medium" data-testid="job-company">{job.company}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          <span>{job.job_type} • {job.experience_required}</span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>{job.salary}</span>
          </div>
        )}
      </div>

      <p className="text-slate-600 text-sm mb-4 line-clamp-2" data-testid="job-description">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills_required.slice(0, 3).map((skill, idx) => (
          <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
            {skill}
          </span>
        ))}
        {job.skills_required.length > 3 && (
          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
            +{job.skills_required.length - 3} more
          </span>
        )}
      </div>

      <Button
        onClick={handleApply}
        disabled={applying}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        data-testid="apply-button"
      >
        {applying ? 'Applying...' : 'Apply Now'}
      </Button>
    </div>
  );
};