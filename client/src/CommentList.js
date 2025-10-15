import React, { useEffect, useState } from "react";
import axios from "axios";

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]); 

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/posts/${postId}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      } 
    };
    fetchComments(); 
  }, [postId]); // lisatud postId sõltuvus, et uuendada kommentaare kui post muutub

  const renderedComments = comments.map((comment) => (
    <li key={comment.id}>{comment.content}</li>
  ));

  return <ul>{renderedComments}</ul>;
}   

export default CommentList;
