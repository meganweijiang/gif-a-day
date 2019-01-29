import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="App">
    <div className="outer">
      <div className="container">
        <h1>Page not found.</h1>
        <Link className="go-home" to="/">&#8592; Go Home</Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
