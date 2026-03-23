import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { searchJobs } from '../api';
import { toast } from 'sonner';
import { JobCard } from '../components/JobCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    job_type: ''
  });

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.location) params.location = filters.location;
      if (filters.job_type) params.job_type = filters.job_type;

      const response = await searchJobs(params);
      setJobs(response.data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" data-testid="jobs-page">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Job Search</h1>
        <p className="text-slate-600 text-lg">Find your perfect opportunity</p>
      </div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
        data-testid="search-filter-section"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by job title, skills..."
                className="pl-10"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="search-keyword-input"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400 z-10" />
              <Input
                placeholder="Location"
                className="pl-10"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                data-testid="search-location-input"
              />
            </div>
          </div>

          <div>
            <Select
              value={filters.job_type}
              onValueChange={(value) => setFilters({ ...filters, job_type: value })}
            >
              <SelectTrigger data-testid="job-type-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="job">Jobs</SelectItem>
                <SelectItem value="internship">Internships</SelectItem>
                <SelectItem value="course">Courses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleSearch}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          data-testid="search-button"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </motion.div>

      {/* Results */}
      <div data-testid="search-results">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            {jobs.length} {jobs.length === 1 ? 'result' : 'results'} found
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12" data-testid="no-results">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};