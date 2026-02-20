import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const { userData, setUserData, backendUrl } = useContext(AppContext);
  
  // Force refresh to clear any cached references
  
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: userData?.name || '',
      email: userData?.email || '',
      phone: '',
      address: '',
      linkedin: '',
      portfolio: ''
    },
    education: [{ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }],
    experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
    skills: [''],
    projects: [{ title: '', description: '', technologies: '', link: '' }],
    certifications: [{ name: '', issuer: '', date: '', link: '' }]
  });
  
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Handle input changes for personal info
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        [name]: value
      }
    });
  };
  
  // Handle input changes for array fields
  const handleArrayFieldChange = (section, index, field, value) => {
    const updatedSection = [...formData[section]];
    updatedSection[index] = {
      ...updatedSection[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      [section]: updatedSection
    });
  };
  
  // Handle skill input changes
  const handleSkillChange = (index, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = value;
    
    setFormData({
      ...formData,
      skills: updatedSkills
    });
  };
  
  // Add new item to array fields
  const addItem = (section) => {
    let newItem;
    
    switch(section) {
      case 'education':
        newItem = { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' };
        break;
      case 'experience':
        newItem = { company: '', position: '', startDate: '', endDate: '', description: '' };
        break;
      case 'skills':
        newItem = '';
        break;
      case 'projects':
        newItem = { title: '', description: '', technologies: '', link: '' };
        break;
      case 'certifications':
        newItem = { name: '', issuer: '', date: '', link: '' };
        break;
      default:
        return;
    }
    
    setFormData({
      ...formData,
      [section]: [...formData[section], newItem]
    });
  };
  
  // Remove item from array fields
  const removeItem = (section, index) => {
    if (formData[section].length === 1) return;
    
    const updatedSection = formData[section].filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      [section]: updatedSection
    });
  };
  
  // Generate resume HTML
  const generateResumeHTML = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${formData.personalInfo.fullName} - Resume</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2a5885;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2a5885;
            padding-bottom: 10px;
          }
          .contact-info {
            text-align: center;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .item {
            margin-bottom: 15px;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
          }
          .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .skill {
            background-color: #f0f0f0;
            padding: 5px 10px;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${formData.personalInfo.fullName}</h1>
        </div>
        
        <div class="contact-info">
          <p>
            ${formData.personalInfo.email} | 
            ${formData.personalInfo.phone} | 
            ${formData.personalInfo.address}
            ${formData.personalInfo.linkedin ? ` | <a href="${formData.personalInfo.linkedin}">LinkedIn</a>` : ''}
            ${formData.personalInfo.portfolio ? ` | <a href="${formData.personalInfo.portfolio}">Portfolio</a>` : ''}
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">Education</h2>
          ${formData.education.map(edu => `
            <div class="item">
              <div class="item-header">
                <span>${edu.institution} - ${edu.degree} in ${edu.fieldOfStudy}</span>
                <span>${edu.startDate} - ${edu.endDate}</span>
              </div>
              <p>${edu.description}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h2 class="section-title">Experience</h2>
          ${formData.experience.map(exp => `
            <div class="item">
              <div class="item-header">
                <span>${exp.position} at ${exp.company}</span>
                <span>${exp.startDate} - ${exp.endDate}</span>
              </div>
              <p>${exp.description}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h2 class="section-title">Skills</h2>
          <div class="skills-list">
            ${formData.skills.filter(skill => skill.trim() !== '').map(skill => `
              <span class="skill">${skill}</span>
            `).join('')}
          </div>
        </div>
        
        ${formData.projects.some(project => project.title.trim() !== '') ? `
          <div class="section">
            <h2 class="section-title">Projects</h2>
            ${formData.projects.filter(project => project.title.trim() !== '').map(project => `
              <div class="item">
                <h3>${project.title} ${project.link ? `<a href="${project.link}" target="_blank">[Link]</a>` : ''}</h3>
                <p>${project.description}</p>
                <p><strong>Technologies:</strong> ${project.technologies}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${formData.certifications.some(cert => cert.name.trim() !== '') ? `
          <div class="section">
            <h2 class="section-title">Certifications</h2>
            ${formData.certifications.filter(cert => cert.name.trim() !== '').map(cert => `
              <div class="item">
                <div class="item-header">
                  <span>${cert.name} - ${cert.issuer}</span>
                  <span>${cert.date}</span>
                </div>
                ${cert.link ? `<p><a href="${cert.link}" target="_blank">View Certificate</a></p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </body>
      </html>
    `;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Check if user is logged in - using more reliable checks
    if (!userData) {
      setError('You must be logged in to create a resume');
      setIsSubmitting(false);
      return;
    }
    
    // Get the user token from localStorage
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      setError('Authentication token not found. Please log in again.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const resumeHTML = generateResumeHTML();
      const blob = new Blob([resumeHTML], { type: 'text/html' });
      const file = new File([blob], `${formData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html`, { type: 'text/html' });
      
      const formDataToSend = new FormData();
      formDataToSend.append('resume', file);
      
      const response = await axios.post(`${backendUrl}/user/upload-resume`, formDataToSend, {
        headers: {
          'token': userToken,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const data = response.data;
      
      if (data.success) {
        setUserData({
          ...userData,
          resume: data.resumeUrl,
          atsScore: data.atsScore,
          atsImprovements: data.atsImprovements,
          skills: data.skills,
        });
        navigate('/resume-skills');
      } else {
        setError(data.message || 'Failed to upload resume');
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Failed to upload resume');
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An error occurred while creating your resume');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render form sections
  const renderFormSection = () => {
    switch(activeSection) {
      case 'personalInfo':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.personalInfo.fullName}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.personalInfo.address}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.personalInfo.linkedin}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.personalInfo.portfolio}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );
        
      case 'education':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Education</h3>
              <button
                type="button"
                onClick={() => addItem('education')}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Education
              </button>
            </div>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Education #{index + 1}</h4>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('education', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleArrayFieldChange('education', index, 'institution', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleArrayFieldChange('education', index, 'degree', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleArrayFieldChange('education', index, 'fieldOfStudy', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="text"
                        placeholder="MM/YYYY"
                        value={edu.startDate}
                        onChange={(e) => handleArrayFieldChange('education', index, 'startDate', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="text"
                        placeholder="MM/YYYY or Present"
                        value={edu.endDate}
                        onChange={(e) => handleArrayFieldChange('education', index, 'endDate', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={edu.description}
                      onChange={(e) => handleArrayFieldChange('education', index, 'description', e.target.value)}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'experience':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <button
                type="button"
                onClick={() => addItem('experience')}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Experience
              </button>
            </div>
            
            {formData.experience.map((exp, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Experience #{index + 1}</h4>
                  {formData.experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('experience', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'company', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'position', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="text"
                        placeholder="MM/YYYY"
                        value={exp.startDate}
                        onChange={(e) => handleArrayFieldChange('experience', index, 'startDate', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="text"
                        placeholder="MM/YYYY or Present"
                        value={exp.endDate}
                        onChange={(e) => handleArrayFieldChange('experience', index, 'endDate', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'description', e.target.value)}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'skills':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Skills</h3>
              <button
                type="button"
                onClick={() => addItem('skills')}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Skill
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., JavaScript, Project Management, etc."
                  />
                  
                  {formData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('skills', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'projects':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Projects</h3>
              <button
                type="button"
                onClick={() => addItem('projects')}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Project
              </button>
            </div>
            
            {formData.projects.map((project, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Project #{index + 1}</h4>
                  {formData.projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('projects', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => handleArrayFieldChange('projects', index, 'title', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Link</label>
                    <input
                      type="url"
                      value={project.link}
                      onChange={(e) => handleArrayFieldChange('projects', index, 'link', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(e) => handleArrayFieldChange('projects', index, 'technologies', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., React, Node.js, MongoDB"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => handleArrayFieldChange('projects', index, 'description', e.target.value)}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'certifications':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Certifications</h3>
              <button
                type="button"
                onClick={() => addItem('certifications')}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Certification
              </button>
            </div>
            
            {formData.certifications.map((cert, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Certification #{index + 1}</h4>
                  {formData.certifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('certifications', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleArrayFieldChange('certifications', index, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleArrayFieldChange('certifications', index, 'issuer', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="text"
                      placeholder="MM/YYYY"
                      value={cert.date}
                      onChange={(e) => handleArrayFieldChange('certifications', index, 'date', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Link</label>
                    <input
                      type="url"
                      value={cert.link}
                      onChange={(e) => handleArrayFieldChange('certifications', index, 'link', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Resume Builder</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 bg-gray-50 p-4">
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveSection('personalInfo')}
                className={`block w-full text-left px-3 py-2 rounded-md ${activeSection === 'personalInfo' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
              >
                Personal Information
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('education')}
                className={`block w-full text-left px-3 py-2 rounded-md ${activeSection === 'education' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
              >
                Education
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('experience')}
                className={`block w-full text-left px-3 py-2 rounded-md ${activeSection === 'experience' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
              >
                Work Experience
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('skills')}
                className={`block w-full text-left px-3 py-2 rounded-md ${activeSection === 'skills' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
              >
                Skills
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('projects')}
                className={`block w-full text-left px-3 py-2 rounded-md ${activeSection === 'projects' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
              >
                Projects
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('certifications')}
                className={`block w-full text-left px-3 py-2 rounded-md ${activeSection === 'certifications' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
              >
                Certifications
              </button>
            </nav>
          </div>
          
          <div className="w-full md:w-3/4 p-6">
            <form onSubmit={handleSubmit}>
              {renderFormSection()}
              
              <div className="mt-8 flex justify-between">
                <div>
                  {activeSection !== 'personalInfo' && (
                    <button
                      type="button"
                      onClick={() => {
                        const sections = ['personalInfo', 'education', 'experience', 'skills', 'projects', 'certifications'];
                        const currentIndex = sections.indexOf(activeSection);
                        setActiveSection(sections[currentIndex - 1]);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Previous
                    </button>
                  )}
                </div>
                
                <div>
                  {activeSection !== 'certifications' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const sections = ['personalInfo', 'education', 'experience', 'skills', 'projects', 'certifications'];
                        const currentIndex = sections.indexOf(activeSection);
                        setActiveSection(sections[currentIndex + 1]);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating Resume...' : 'Create Resume'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
