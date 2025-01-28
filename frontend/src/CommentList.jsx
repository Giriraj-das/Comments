import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentForm from "./CommentForm.jsx";
import "./CommentList.css";

function CommentList() {
  const [comments, setComments] = useState([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [activeCommentId, setActiveCommentId] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get("http://localhost:8000/comments/", {
          params: {
            sort_by: sortBy,
            order: order,
          },
        });
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
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
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleReplyForm = (commentId) => {
    setActiveCommentId(activeCommentId === commentId ? null : commentId);
  };

  const renderComments = (comments, depth = 0) => {
    return comments.map((comment) => (
      <div key={comment.id} className="comment-item" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="comment-header">
          <img src={comment.avatar_url || "/default-avatar.png"} alt="Avatar" className="avatar" />
          <span className="username">{comment.username || "Anonymous"}</span>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>
        <div className="comment-body">
          <p>{comment.text}</p>
        </div>
        <div className="comment-footer">
          <button className="reply-button" onClick={() => toggleReplyForm(comment.id)}>
            Reply
          </button>
        </div>
        {activeCommentId === comment.id && (
          <CommentForm
            parentId={comment.id}
            onCommentAdded={(newComment) => {
              function addReplyToComments(comments, parentId, newComment) {
                return comments.map((comment) => {
                  if (comment.id === parentId) {
                    return { ...comment, replies: [...(comment.replies || []), newComment] };
                  } else if (comment.replies) {
                    return { ...comment, replies: addReplyToComments(comment.replies, parentId, newComment) };
                  }
                  return comment;
                });
              };
              setComments((prevComments) => addReplyToComments(prevComments, comment.id, newComment));
              setActiveCommentId(null);
            }}
            onClose={() => setActiveCommentId(null)}
            replyingTo={{ avatar: comment.avatar_url, username: comment.username }}
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
    </div>
  );
}

export default CommentList;
