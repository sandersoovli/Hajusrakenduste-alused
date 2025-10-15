import './App.css';
import PostList from './PostList';
import PostCreate from './PostCreate';

const App = () => {
  return (
    <div className="container">
      <h1>Create Post</h1>
      <PostCreate />
      <hr />
      <h1>Posts</h1>
      <PostList />      
    </div>
  );
}

export default App;
