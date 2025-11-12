import axios from "axios";
import { useState } from "react";

const PostCreate = () => {
    const [title, setTitle] = useState('');

    const onChange = (event) => {
        setTitle(event.target.value);
    }

    const onSubmit = async (event) => {
    event.preventDefault();
    try {
        await axios.post('http://localhost:3001/posts', { title });
        setTitle('');
    } catch (err) {
        console.error('Error creating post:', err);
    }
}

    return (
        <div>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        value={title}
                        onChange={onChange} 
                        className="form-control"
                    />
                </div>
                <button type="submit">Loo postitus</button>
            </form> 
        </div>
    )
} 

export default PostCreate;
