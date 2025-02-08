import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { resizeImage } from "./utils/resizeImage.js";
import { validateTags } from "./utils/validateTags.js";
import { validateURL } from "./utils/validateURL.js";
import "./CommentForm.css";

function CommentForm({ parentId = null, onCommentAdded, onClose, replyingTo }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [homepage, setHomepage] = useState("");
  const [homepageError, setHomepageError] = useState("");
  const [text, setText] = useState("");
  const [tagError, setTagError] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaImage, setCaptchaImage] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const textAreaRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const media = import.meta.env.VITE_MEDIA;

  const fetchCaptcha = async () => {
    try {
      const response = await axios.get(`${apiUrl}/captcha/`);
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
    formData.append("home_page", homepage);
    formData.append("text", text);
    formData.append("captcha", captcha);
    formData.append("captcha_key", captchaKey);
    formData.append("parent", parentId !== null ? parentId : "");
    if (avatar) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(avatar.type)) {
        alert("Only PNG, JPG, and JPEG files are allowed for avatars.");
        return;
      }
      formData.append("avatar", avatar);
    }
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await axios.post(`${apiUrl}/comments/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Comment submitted:", response.data);
      setName("");
      setEmail("");
      setHomepage("");
      setText("");
      setCaptcha("");
      setAvatar(null);
      setFile(null);
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

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    const error = validateTags(newText);
    setTagError(error);
  };

  const handleHomepageChange = (e) => {
    const value = e.target.value;
    setHomepage(value);

    if (!validateURL(value)) {
      setHomepageError("Enter a valid URL (e.g., https://example.com)");
    } else {
      setHomepageError("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = ["image/jpeg", "image/png", "image/gif"].includes(file.type);
    const isTextFile = file.type === "text/plain";

    if (isImage) {
      resizeImage(file, 320, 240, (resizedFile, previewUrl) => {
        setFile(resizedFile);
        setPreviewUrl(previewUrl);
      });
    } else if (isTextFile) {
      if (file.size > 100 * 1024) {
        alert("Text file size must not exceed 100KB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target.result); // Сохраняем текст в `previewUrl`
      };
      reader.readAsText(file);

      setFile(file);
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

  const insertTag = (open_tag, close_tag) => {
    const textarea = document.getElementById("text"); // Get textarea
    const start = textarea.selectionStart; // Cursor start position
    const end = textarea.selectionEnd; // Cursor end position
    const selectedText = text.slice(start, end); // Selected text
    const beforeText = text.slice(0, start); // Text before selection
    const afterText = text.slice(end); // Text after selection

    const newText = selectedText
      ? `${beforeText}<${open_tag}>${selectedText}</${close_tag}>${afterText}`
      : `${beforeText}<${open_tag}></${close_tag}>${afterText}`;

    const cursorPosition = selectedText
      ? start + `<${open_tag}>`.length + selectedText.length + `</${close_tag}>`.length
      : start + `<${open_tag}>`.length;

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
              <img src={replyingTo.avatar ? replyingTo.avatar : `${media}/avatars/default_avatar.jpeg`} alt="Avatar" className="avatar-small" />
              <span className="username">{replyingTo.username || "Anonymous"}</span>
            </div>
          )}
          <div className="toolbar tag-buttons">
            <button type="button" onClick={() => insertTag("i", "i")}>Italic</button>
            <button type="button" onClick={() => insertTag("strong", "strong")}>Bold</button>
            <button type="button" onClick={() => insertTag("code", "code")}>Code</button>
            <button type="button" onClick={() => insertTag("a href=\"\" title=\"\"", "a")}>Link</button>
            <label className="upload-button">
              File
              <input type="file" accept=".jpg,.jpeg,.png,.gif,.txt" onChange={handleFileChange} />
            </label>
          </div>

          <textarea id="text" value={text} onChange={handleTextChange} required ref={textAreaRef} />
          {tagError && <p className="error-message">{tagError}</p>}

          <div className="form-actions">
            <button type="submit">Submit Comment</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </div>

        {file && (
          <div className="file-preview">
            {file.type === "text/plain" ? (
              <pre className="text-preview-content">{previewUrl}</pre>
            ) : (
              <img src={previewUrl} alt="Preview" />
            )}
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
            <input type="url" id="homepage" value={homepage} onChange={handleHomepageChange} />
            {homepageError && (<p className="error-message">{homepageError}</p>)}
          </div>
          <div className="form-group">
            <label htmlFor="captcha">CAPTCHA:</label>
            <div className="captcha-container">
              {captchaImage && (<img src={`${apiUrl}${captchaImage}`} alt="captcha" />)}
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
