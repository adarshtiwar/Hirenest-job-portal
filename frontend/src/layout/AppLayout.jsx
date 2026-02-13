import React from "react";
import Navbar from "../components/Navbar";

const AppLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="w-[90%] m-auto overflow-hidden">{children}</main>
    </>
  );
};

export default AppLayout;
