import React from "react";

const CommentList = ({ comments }) => { 
  
  const renderedComments = comments && comments.map((comment) => {
    let content;

    if (comment.status === 'approved') {
        content = comment.content;
    } else if (comment.status === 'pending') {
        // Muutus 1: Kuvame 'pending' staatuse
        content = 'This comment is awaiting moderation.';
    } else if (comment.status === 'rejected') {
        // Muutus 2: Kuvame 'rejected' staatuse
        content = 'This comment has been rejected.';
    }

    return (
        <li key={comment.id}>
            {content}
        </li>
    );
  });

  return <ul>{renderedComments}</ul>;
}   

export default CommentList;