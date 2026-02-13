import React, { useState } from 'react';
import './ResumeStyles.css';

const SkillsForm = ({ data, onChange }) => {
  const [skillsList, setSkillsList] = useState(data || []);
  const [currentSkill, setCurrentSkill] = useState({
    name: '',
    level: 'Intermediate' // Default level
  });

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSkill(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (!currentSkill.name.trim()) {
      alert('Skill name is required');
      return;
    }

    // Check if skill already exists
    const skillExists = skillsList.some(
      skill => skill.name.toLowerCase() === currentSkill.name.toLowerCase()
    );

    if (skillExists) {
      alert('This skill already exists in your list');
      return;
    }

    const updatedList = [...skillsList, { ...currentSkill }];
    setSkillsList(updatedList);
    onChange(updatedList);
    
    // Reset form
    setCurrentSkill({
      name: '',
      level: 'Intermediate'
    });
  };

  const handleDeleteSkill = (index) => {
    const updatedList = skillsList.filter((_, i) => i !== index);
    setSkillsList(updatedList);
    onChange(updatedList);
  };

  const handleUpdateSkillLevel = (index, newLevel) => {
    const updatedList = [...skillsList];
    updatedList[index] = {
      ...updatedList[index],
      level: newLevel
    };
    setSkillsList(updatedList);
    onChange(updatedList);
  };

  // Group skills by level for better organization
  const groupedSkills = skillsList.reduce((acc, skill) => {
    if (!acc[skill.level]) {
      acc[skill.level] = [];
    }
    acc[skill.level].push(skill);
    return acc;
  }, {});

  return (
    <div className="resume-form-section">
      <h2>Skills</h2>
      
      <div className="skills-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Skill Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={currentSkill.name}
              onChange={handleInputChange}
              placeholder="e.g., JavaScript, Project Management, etc."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="level">Proficiency Level</label>
            <select
              id="level"
              name="level"
              value={currentSkill.level}
              onChange={handleInputChange}
            >
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="form-group-button">
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleAddSkill}
            >
              Add Skill
            </button>
          </div>
        </div>
      </div>

      <div className="skills-list">
        <h3>Your Skills</h3>
        {skillsList.length === 0 ? (
          <p className="no-items">No skills added yet</p>
        ) : (
          <div className="skills-by-level">
            {skillLevels.map(level => 
              groupedSkills[level] && groupedSkills[level].length > 0 && (
                <div key={level} className="skill-level-group">
                  <h4>{level}</h4>
                  <div className="skill-tags">
                    {groupedSkills[level].map((skill, index) => {
                      const originalIndex = skillsList.findIndex(s => 
                        s.name === skill.name && s.level === skill.level
                      );
                      return (
                        <div key={index} className="skill-tag">
                          <span>{skill.name}</span>
                          <div className="skill-actions">
                            <select
                              value={skill.level}
                              onChange={(e) => handleUpdateSkillLevel(originalIndex, e.target.value)}
                              className="skill-level-select"
                            >
                              {skillLevels.map(l => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                            <button 
                              type="button" 
                              className="btn-icon" 
                              onClick={() => handleDeleteSkill(originalIndex)}
                              aria-label="Remove skill"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className="skills-tips">
        <h4>Tips for Skills Section</h4>
        <ul>
          <li>Include both technical and soft skills relevant to your target job</li>
          <li>Be honest about your proficiency levels</li>
          <li>Focus on quality over quantity - highlight your strongest skills</li>
          <li>Include industry-specific keywords to pass ATS (Applicant Tracking Systems)</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillsForm;