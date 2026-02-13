import React, { useState } from 'react';
import axios from 'axios';

const ApplicationEnhancer = ({ coverLetter, setCoverLetter }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState('');

  const getAISuggestions = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/ai/enhance-application', { coverLetter });
      setSuggestions(response.data.enhancedCoverLetter);
      setLoading(false);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setLoading(false);
    }
  };

  const applySuggestions = () => {
    if (suggestions) {
      setCoverLetter(suggestions);
      setSuggestions('');
    }
  };

  return (
    <div className="application-enhancer mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-3">AI Cover Letter Suggestions</h3>
      {loading ? (
        <div className="loading-spinner flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : suggestions ? (
        <div className="suggestions-container">
          <div className="suggestions-content p-3 bg-white border border-gray-200 rounded-md mb-3">
            {suggestions}
          </div>
          <div className="suggestions-actions flex gap-3">
            <button 
              onClick={applySuggestions}
              className="apply-btn bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Apply Suggestions
            </button>
            <button 
              onClick={() => setSuggestions('')}
              className="dismiss-btn bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : (
        <div className="no-suggestions">
          <p className="text-gray-600 mb-3">Click "Get AI Suggestions" to enhance your cover letter.</p>
          <button 
            onClick={getAISuggestions}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Get Suggestions
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationEnhancer;