import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./CommentForm.css";

function CommentForm({ parentId = null, onCommentAdded, onClose, replyingTo }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [homepage, setHomepage] = useState("");
  const [text, setText] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaImage, setCaptchaImage] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const textAreaRef = useRef(null);

  const fetchCaptcha = async () => {
    try {
      const response = await axios.get("http://localhost:8000/captcha/");
      setCaptchaImage(response.data.captcha_image);
      setCaptchaKey(response.data.captcha_key);
    } catch (error) {
      console.error("Error fetching CAPTCHA:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", name);
    formData.append("email", email);
    formData.append("homepage", homepage);
    formData.append("text", text);
    formData.append("captcha", captcha);
    formData.append("captcha_key", captchaKey);
    formData.append("parent", parentId);
    if (avatar) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(avatar.type)) {
        alert("Only PNG, JPG, and JPEG files are allowed for avatars.");
        return;
      }
      formData.append("avatar", avatar);
    }
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const response = await axios.post("http://localhost:8000/comments/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Comment submitted:", response.data);
      setName("");
      setEmail("");
      setHomepage("");
      setText("");
      setCaptcha("");
      setAvatar(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaptchaError("");
      fetchCaptcha();
      if (onCommentAdded) onCommentAdded(response.data);
    } catch (error) {
      const serverError = error.response?.data?.error;
      console.log("Error submitting comment", error.response?.data || error);
      setCaptchaError(serverError);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = ["image/jpeg", "image/png", "image/gif"].includes(file.type);
    const isTextFile = file.type === "text/plain";

    if (isImage) {
      resizeImage(file, 320, 240, (resizedFile, previewUrl) => {
        setSelectedFile(resizedFile);
        setPreviewUrl(previewUrl);
      });
    } else if (isTextFile) {
      if (file.size > 100 * 1024) {
        alert("Text file size must not exceed 100KB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(null);
    } else {
      alert("Only JPG, PNG, GIF, or TXT files are allowed.");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = ["image/jpeg", "image/png", "image/gif"].includes(file.type);
    if (!isImage) {
      alert("Only JPG, PNG, and GIF files are allowed for avatars.");
      return;
    }

    resizeImage(file, 100, 100, (resizedFile) => {
      setAvatar(resizedFile);
    });
  };

  const resizeImage = (file, maxWidth, maxHeight, callback) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;
        const scaleFactor = Math.min(maxWidth / width, maxHeight / height, 1);
        width *= scaleFactor;
        height *= scaleFactor;

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          callback(new File([blob], file.name, { type: file.type }), URL.createObjectURL(blob));
        }, file.type);
      };
    };

    reader.readAsDataURL(file);
  };

  const insertTag = (tag) => {
  const textarea = document.getElementById("text"); // Get textarea
  const start = textarea.selectionStart; // Cursor start position
  const end = textarea.selectionEnd; // Cursor end position
  const selectedText = text.slice(start, end); // Selected text
  const beforeText = text.slice(0, start); // Text before selection
  const afterText = text.slice(end); // Text after selection

  const newText = selectedText
    ? `${beforeText}<${tag}>${selectedText}</${tag}>${afterText}`
    : `${beforeText}<${tag}></${tag}>${afterText}`;

  const cursorPosition = selectedText
    ? start + `<${tag}>`.length + selectedText.length + `</${tag}>`.length
    : start + `<${tag}>`.length;

  setText(newText);

  // Set cursor to the new position
  setTimeout(() => {
    textarea.focus();  // Return focus to textarea
    textarea.setSelectionRange(cursorPosition, cursorPosition);
  }, 0);
};

  useEffect(() => {
    fetchCaptcha();
  }, []);

  return (
    <div className="reply-form-container">
      <form className="reply-form" onSubmit={handleSubmit}>
        <div className="reply-text-area">
          {replyingTo && (
            <div className="reply-to">
              <span>Reply to:</span>
              <img src={replyingTo.avatar ? `http://localhost:8000/${replyingTo.avatar}` : "http://localhost:8000/uploads/avatars/default_avatar.jpeg"} alt="Avatar" className="avatar-small" />
              <span className="username">{replyingTo.username || "Anonymous"}</span>
            </div>
          )}
          <div className="toolbar tag-buttons">
            <button type="button" onClick={() => insertTag("i")}>Italic</button>
            <button type="button" onClick={() => insertTag("strong")}>Bold</button>
            <button type="button" onClick={() => insertTag("code")}>Code</button>
            <button type="button" onClick={() => insertTag("a")}>Link</button>
            <label className="upload-button">
              File
              <input type="file" accept=".jpg,.jpeg,.png,.gif,.txt" onChange={handleFileChange} />
            </label>
          </div>

          <textarea id="text" value={text} onChange={(e) => setText(e.target.value)} required ref={textAreaRef} />

          <div className="form-actions">
            <button type="submit">Submit Comment</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </div>

        {previewUrl && (
          <div className="file-preview">
            <img src={previewUrl} alt="Preview" />
          </div>
        )}

        <div className="reply-form-fields">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="homepage">Homepage (optional):</label>
            <input type="url" id="homepage" value={homepage} onChange={(e) => setHomepage(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="captcha">CAPTCHA:</label>
            <div className="captcha-container">
              {captchaImage && (<img src={`http://localhost:8000${captchaImage}`} alt="captcha" />)}
              {captchaError && (<p className="error-message">{captchaError}</p>)}
              <input type="text" id="captcha" value={captcha} onChange={(e) => setCaptcha(e.target.value)} required />
              <button type="button" onClick={fetchCaptcha}>Refresh CAPTCHA</button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="avatar">Upload Avatar (optional):</label>
            <input type="file" id="avatar" accept=".jpg,.jpeg,.png,.gif" onChange={handleAvatarChange} />
          </div>
        </div>
      </form>
    </div>
  );
}

export default CommentForm;
