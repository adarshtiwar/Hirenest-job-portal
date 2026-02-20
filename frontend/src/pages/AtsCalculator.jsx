import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const AtsCalculator = () => {
  const { userData } = useContext(AppContext);
  const score = Number(userData?.atsScore || 0);
  const improvements = Array.isArray(userData?.atsImprovements)
    ? userData.atsImprovements
    : [];
  const skills = Array.isArray(userData?.skills) ? userData.skills : [];

  return (
    <section className="max-w-5xl mx-auto py-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">ATS Calculation</h1>
      <p className="text-gray-600 mb-6">
        This is generated automatically after resume upload.
      </p>

      {!userData?.resume ? (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded">
          No resume found. Upload your resume from{" "}
          <Link to="/applications" className="underline font-medium">
            Applied Jobs
          </Link>{" "}
          to get ATS score and improvements.
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <p className="text-sm text-gray-500 mb-1">ATS Score</p>
            <p
              className={`text-4xl font-bold ${
                score >= 70
                  ? "text-green-600"
                  : score >= 40
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {score}%
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Key Areas of Improvement
            </h2>
            {improvements.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {improvements.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">
                Your resume looks good. Keep tailoring it for each job role.
              </p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Extracted Skills
            </h2>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No skills extracted yet.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default AtsCalculator;
