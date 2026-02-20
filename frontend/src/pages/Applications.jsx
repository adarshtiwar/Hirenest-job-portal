import React, { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import { assets } from "../assets/assets";
import moment from "moment";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { LoaderCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const Applications = () => {
  const {
    userApplication,
    applicationsLoading,
    backendUrl,
    userToken,
    userData,
    setUserData,
    fetchUserData,
    fetchUserApplication,
  } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResumeSave = async () => {
    if (!resumeFile) {
      toast.error("Please select a resume file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const { data } = await axios.post(
        `${backendUrl}/user/upload-resume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: userToken,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setUserData((prev) => ({
          ...prev,
          resume: data.resumeUrl,
          atsScore: data.atsScore,
          atsImprovements: data.atsImprovements,
          skills: data.skills,
        }));
        setIsEdit(false);
        fetchUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error(error?.response?.data?.message || "Resume upload failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserApplication();
  }, []);

  return (
    <>
     
      <section>
        {/* Resume Section */}
        <div className="mb-10">
          <h1 className="text-lg font-medium mb-3">Your Resume</h1>
          {isEdit ? (
            <div className="flex items-center flex-wrap gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
                <span className="bg-blue-100 text-blue-500 rounded px-3 py-1.5 text-sm hover:bg-blue-200 transition-colors">
                  {resumeFile ? resumeFile.name : "Select resume"}
                </span>
                <img
                  className="w-8"
                  src={assets.profile_upload_icon}
                  alt="Upload icon"
                />
              </label>

              <div className="flex gap-2">
                <button
                  disabled={!resumeFile || loading}
                  onClick={handleResumeSave}
                  className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors border border-gray-200  ${
                    !resumeFile || loading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-100 text-blue-500 hover:bg-blue-200 cursor-pointer"
                  }`}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin w-4 h-4" />
                      Uploading...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {userData?.resume ? (
                <a
                  href={userData.resume}
                  target="_blank"
                  className="bg-blue-100 text-blue-500 rounded px-3 py-1.5 text-sm hover:bg-blue-200 transition-colors"
                >
                  View Resume
                </a>
              ) : (
                <span className="bg-blue-100 text-blue-500 rounded px-3 py-1.5 text-sm hover:bg-blue-200 transition-colors">
                  No resume uploaded
                </span>
              )}
              <button
                onClick={() => setIsEdit(true)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {userData?.resume ? "Update" : "Upload"}
              </button>
            </div>
          )}
        </div>

        {userData?.resume && (
          <div className="mb-10 border border-gray-200 rounded-lg p-4 bg-white">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              ATS Score:{" "}
              <span
                className={
                  userData?.atsScore >= 70
                    ? "text-green-600"
                    : userData?.atsScore >= 40
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              >
                {Number(userData?.atsScore || 0)}%
              </span>
            </h2>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Key Areas of Improvement
            </h3>
            {Array.isArray(userData?.atsImprovements) &&
            userData.atsImprovements.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {userData.atsImprovements.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">
                Your resume looks strong. Keep tailoring it for each job post.
              </p>
            )}
          </div>
        )}

        {/* Applications Table */}
        {applicationsLoading ? (
          <div className="flex justify-center items-center mt-20">
            <Loader />
          </div>
        ) : !userApplication || userApplication.length === 0 ? (
          <p className="text-center text-gray-500">No applications found.</p>
        ) : (
          <>
            <h1 className="text-lg font-medium mb-3">Jobs Applied</h1>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...userApplication].reverse().map((job) => (
                      <tr key={job._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <img
                              src={
                                job?.companyId?.image || assets.default_profile
                              }
                              alt={job?.companyId?.name || "Company logo"}
                              className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.src = assets.default_profile;
                              }}
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900 truncate max-w-[150px]">
                              {job?.companyId?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                          {job?.jobId?.title}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">
                          {job?.jobId?.location}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">
                          {moment(job.date).format("ll")}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 inline-flex text-xs font-semibold ${
                              job.status === "Pending"
                                ? "text-blue-500"
                                : job.status === "Rejected"
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
      <Footer />
    </>
  );
};

export default Applications;
