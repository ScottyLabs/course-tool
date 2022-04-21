import React from "react";

export const SmallButton = ({ onClick, children }) => {
  return (
    <div
      className="rounded-md bg-grey-50 py-1 px-2 text-sm text-grey-600 hover:cursor-pointer hover:bg-grey-100 dark:bg-grey-800 dark:text-grey-200 dark:hover:bg-grey-700"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const FlushedButton = ({ onClick, children }) => {
  return (
    <div
      className="rounded-md py-1 px-2 text-sm text-grey-700 hover:cursor-pointer hover:bg-grey-50 dark:bg-grey-900 dark:text-grey-200 dark:hover:bg-grey-800"
      onClick={onClick}
    >
      {children}
    </div>
  );
};
