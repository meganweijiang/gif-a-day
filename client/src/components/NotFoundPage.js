import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="App">
    <div className="outer">
      <div className="container">
        <Link className="go-home" to="/">&#8592; Go Home</Link>
        <h1>Page not found.</h1>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
