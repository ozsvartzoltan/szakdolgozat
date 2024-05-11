import React from "react";

const Snackbar = ({ open, message, color }) => {
  if (!open) return null;
  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded text-white ${
        color === "green"
          ? "bg-green-500"
          : color === "orange"
          ? "bg-orange-400"
          : "bg-red-500"
      }`}
    >
      {message}
    </div>
  );
};

export default Snackbar;
