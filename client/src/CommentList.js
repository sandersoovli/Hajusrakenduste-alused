import React from "react";
// Eemalda useEffect ja useState, kuna andmed tulevad PostListilt
// Eemalda axios, kuna see ei ole enam vajalik

// MUUTUS: Komponent võtab nüüd vastu ka 'comments' prop'i, mis sisaldab kommentaaride massiivi
const CommentList = ({ comments }) => { 
  
  // Kommentaaride massiiv peaks olema juba olemas ja korrektne. 
  // Kontrollime, et 'comments' on massiiv ja kuvame need.
  // Kasutame 'comments' otse, mitte useState muutuja.
  const renderedComments = comments && comments.map((comment) => (
    <li key={comment.id}>{comment.content}</li>
  ));

  return <ul>{renderedComments}</ul>;
}   

export default CommentList;