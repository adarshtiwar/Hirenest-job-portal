import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import About from "./pages/About";
import AllJobs from "./pages/AllJobs";
import Applications from "./pages/Applications";
import ApplyJob from "./pages/ApplyJob";
import CandidatesLogin from "./pages/CandidatesLogin";
import CandidatesSignup from "./pages/CandidatesSignup";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import RecruiterLogin from "./pages/RecruiterLogin";
import RecruiterSignup from "./pages/RecruiterSignup";
import Dashborad from "./pages/Dashborad";
import AddJobs from "./pages/AddJobs";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeSkills from "./pages/ResumeSkills";
import Chat from "./pages/Chat";
import { AppContext } from "./context/AppContext";

const App = () => {
  const { companyToken } = useContext(AppContext);

  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout><Home /></AppLayout>} />
        <Route path="/all-jobs/:category" element={<AppLayout><AllJobs /></AppLayout>} />
        <Route path="/terms" element={<AppLayout><Terms /></AppLayout>} />
        <Route path="/about" element={<AppLayout><About /></AppLayout>} />
        <Route path="/apply-job/:id" element={<AppLayout><ApplyJob /></AppLayout>} />
        <Route path="/applications" element={<AppLayout><Applications /></AppLayout>} />
        <Route path="/candidate-login" element={<AppLayout><CandidatesLogin /></AppLayout>} />
        <Route path="/candidate-signup" element={<AppLayout><CandidatesSignup /></AppLayout>} />
        <Route path="/recruiter-login" element={<AppLayout><RecruiterLogin /></AppLayout>} />
        <Route path="/recruiter-signup" element={<AppLayout><RecruiterSignup /></AppLayout>} />
        <Route path="/resume-builder" element={<AppLayout><ResumeBuilder /></AppLayout>} />
        <Route path="/resume-skills" element={<AppLayout><ResumeSkills /></AppLayout>} />
        <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
        <Route path="/dashboard" element={<Dashborad />}>
          <Route path="add-job" element={<AddJobs />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="view-applications" element={<ViewApplications />} />
          <Route path="messages" element={<Chat />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
