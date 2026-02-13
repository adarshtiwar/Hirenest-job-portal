import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import JobCard from '../components/JobCard';

const ResumeSkills = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const [skills, setSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [extracting, setExtracting] = useState(false);
  
  useEffect(() => {
    if (userData && userData.resume) {
      extractSkills();
    } else {
      setLoading(false);
      setError('No resume found. Please upload or create a resume first.');
    }
  }, [userData]);
  
  const extractSkills = async () => {
    try {
      setExtracting(true);
      setError('');
      
      // Using the correct API endpoint path with full URL
      const response = await fetch(`${backendUrl}/api/resume/extract-skills/${userData._id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSkills(data.skills);
        getJobRecommendations();
      } else {
        setError(data.message || 'Failed to extract skills');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred while extracting skills');
      setLoading(false);
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };
  
  const getJobRecommendations = async () => {
    try {
      // Using the correct API endpoint path with full URL
      const response = await fetch(`${backendUrl}/api/resume/recommendations/${userData._id}`);
      const data = await response.json();
      
      if (response.ok) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.message || 'Failed to get job recommendations');
      }
    } catch (err) {
      setError('An error occurred while getting job recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Resume Skills & Recommendations</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          {!userData?.resume && (
            <div className="mt-2">
              <Link to="/resume-builder" className="text-blue-500 hover:underline">
                Create a resume
              </Link>
            </div>
          )}
        </div>
      )}
      
      {extracting && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p>Extracting skills from your resume...</p>
        </div>
      )}
      
      {!extracting && skills.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Skills Extracted from Your Resume</h2>
          
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {loading && !extracting && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p>Finding job recommendations based on your skills...</p>
        </div>
      )}
      
      {!loading && recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Recommended Jobs Based on Your Skills</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((job) => (
              <div key={job._id} className="relative">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg z-10">
                  {job.matchPercentage}% Match
                </div>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!loading && recommendations.length === 0 && !error && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No job recommendations found based on your skills.</p>
          <p className="mt-2">
            <Link to="/all-jobs" className="text-blue-500 hover:underline">
              Browse all available jobs
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeSkills;