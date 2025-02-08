import { useState } from "react";
import "./ShowImage.css";

const ShowImage = ({ src }) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  return (
    <div className="comment-image-container">
      <img
        src={src}
        alt="Attached image"
        className={`comment-image ${isEnlarged ? "enlarged" : ""}`}
        onClick={() => setIsEnlarged(!isEnlarged)}
      />
    </div>
  );
};

export default ShowImage;
