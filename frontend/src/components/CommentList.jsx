import React, { useState, useEffect} from "react";
import axios from "axios";
import CommentForm from "./CommentForm.jsx";
import ReplyButton from "./ReplyButton/ReplyButton.jsx";
import "./CommentList.css";

function CommentList() {
  const [comments, setComments] = useState([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [activeRootComment, setActiveRootComment] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${apiUrl}/comments/`, {
          params: {
            sort_by: sortBy,
            order: order,
          },
        });
        setComments(response.data);
      } catch (error) {
        console.error("Error getting comments:", error);
      }
    };

    fetchComments();
  }, [sortBy, order]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setOrder("desc");
    }
  };

  const formatDate = (dateString) => {
    const options = {
      month: "short",
      year: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleCommentForm = (commentId = null) => {
    if (activeCommentId === commentId) {
      setActiveCommentId(null);
    } else {
      setActiveCommentId(commentId);
      setActiveRootComment(false);
    }
  };

  const toggleRootCommentForm = () => {
    setActiveRootComment(!activeRootComment);
    setActiveCommentId(null);
  };

  const addReplyToComments = (comments, parentId, newComment) => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...(comment.replies || []), newComment] };
      } else if (comment.replies) {
        return { ...comment, replies: addReplyToComments([...comment.replies], parentId, newComment) };
      }
      return comment;
    });
  };

  const renderComments = (comments, depth = 0) => {
    return comments.map((comment) => (
      <div key={comment.id} className="comment-item" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="comment-header">
          <img src={comment.avatar ? `${apiUrl}${comment.avatar}` : `${apiUrl}/uploads/avatars/default_avatar.jpeg`} alt="Avatar" className="avatar" />
          <span className="username">{comment.username || "Anonymous"}</span>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>
        <div className="comment-body">
          <p>{comment.text}</p>
        </div>
        <div className="comment-footer">
          <ReplyButton onClick={() => toggleCommentForm(comment.id)}>
            Reply
          </ReplyButton>
        </div>
        {activeCommentId === comment.id && (
          <CommentForm
            parentId={comment.id}
            onCommentAdded={(newComment) => {
              setComments((prevComments) => addReplyToComments(prevComments, comment.id, newComment));
              setActiveCommentId(null);
            }}
            onClose={() => setActiveCommentId(null)}
            replyingTo={{ avatar: comment.avatar, username: comment.username }}
          />
        )}
        {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, depth + 1)}
      </div>
    ));
  };

  return (
    <div>
      <div>
        <button onClick={() => handleSort("username")}>
          Sort by Username {sortBy === "username" && (order === "asc" ? "↑" : "↓")}
        </button>
        <button onClick={() => handleSort("email")}>
          Sort by Email {sortBy === "email" && (order === "asc" ? "↑" : "↓")}
        </button>
        <button onClick={() => handleSort("created_at")}>
          Sort by Date {sortBy === "created_at" && (order === "asc" ? "↑" : "↓")}
        </button>
      </div>

      <div className="comment-list-container">
        {comments.length === 0 ? <p>No comments yet!</p> : renderComments(comments)}
      </div>

      <div className="add-root-comment">
        <ReplyButton onClick={() => toggleRootCommentForm(null)}>
          {activeRootComment ? "Cancel" : "Add Comment"}
        </ReplyButton>
      </div>

      {activeRootComment && (
        <CommentForm
          parentId={null}
          onCommentAdded={(newComment) => {
            setComments((prevComments) => [newComment, ...prevComments]);
            setActiveRootComment(false);
          }}
          onClose={() => setActiveRootComment(false)}
        />
      )}

    </div>
  );
}

export default CommentList;
