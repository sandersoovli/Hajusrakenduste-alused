import axios from "axios";
import { useState } from "react";

const CommentCreate = ({postId}) =>{
    const[content, setContent] = useState('')
    
    const onChange = (event) =>{
        setContent(event.target.value)
    } 

    const onSubmit = async (event) =>{
        event.preventDefault()
        // KONTROLL: Päring tehakse õigele kommentaaride teenusele (5001)
        await axios.post(`http://localhost:5001/posts/${postId}/comments`, { content })
        setContent('')
    } 

    return (
  <div>
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>New Comment</label>
        <input
          value={content}
          onChange={onChange}
          className="form-control"
        /> 
      </div>
      <button className="btn btn-primary">Submit</button>
    </form>
  </div>
)

} 

export default CommentCreate