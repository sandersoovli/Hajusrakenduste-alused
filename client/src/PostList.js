import { useState, useEffect } from "react";
import axios from "axios";
import CommentsList from './CommentList';
import CommentCreate from './CommentCreate'; // Kasutan CommentsCreate asemel CommentCreate

const PostList = () => {
    const [posts, setPosts] = useState({}); // Muutsin algse väärtuse objektiks, et sobituda Query teenuse andmestruktuuriga
    
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // MUUTUS 1: Pärime andmed Query-teenuselt (5002)
                const res = await axios.get('http://localhost:5002/posts'); 
                setPosts(res.data);
            } catch (err) {
                console.error(err);
            } 
        };
        fetchPosts(); 
    }, []);

    console.log(posts);

    // MUUTUS 2: Käsitseme posts andmeid kui objekti ja teisendame massiiviks
    const postsForRender = Object.values(posts).map(post => (
        <div className="card" style={{ width: '30%', marginBottom: '20px'}} key={post.id}>
            <div className="card-body">
                <h3>{post.title}</h3>
                
                {/* MUUTUS 3: Edastame Query-teenuselt saadud kommentaarid otse prop'ina CommentsListile */}
                <CommentsList postId={post.id} comments={post.comments} /> 
                
                <CommentCreate postId={post.id} /> 
            </div>
        </div>
    ));

    return (
        <div className="d-flex flex-row flex-wrap justify-content-between">
           {postsForRender} 
        </div>
    );
} 

export default PostList;