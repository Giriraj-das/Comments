import React from 'react';
import CommentList from './CommentList.jsx';
import './App.css';


function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Comments</h1>
      </header>
      <main>
        <CommentList />
      </main>
    </div>
  );
}

export default App;
