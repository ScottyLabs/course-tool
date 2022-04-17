import React from "react";

const Topbar = ({ children }) => {
  return (
    <div className="sticky top-0 z-10 bg-white p-8 text-grey-700 drop-shadow-lg dark:bg-grey-900 dark:text-grey-200">
      {children}
    </div>
  );
};

export default Topbar;
