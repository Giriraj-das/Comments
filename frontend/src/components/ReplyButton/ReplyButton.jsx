import React from "react";
import "./ReplyButton.css";


const ReplyButton = ({ onClick, children }) => {
  return (
    <button className="reply-button" onClick={onClick}>
      {children}
    </button>
  );
};

export default ReplyButton;
