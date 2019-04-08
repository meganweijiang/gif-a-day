import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class About extends Component {
  render() {
    return (
      <div className="App">
        <div className="outer">
          <div className="container">
            <header className="App-header">
              <h1>About</h1>
            </header>
            <p>This page was created by <a href="https://github.com/meganweijiang">Megan Weijiang</a>.</p>
            <br/>
            <p>Built with React, Node.js, Firebase, the GIPHY API, and Redis.</p>
            <p>Emailing is done with Nodemailer and is scheduled as a Cron job on a Heroku server.</p>
            <br/>
            <Link className='go-home' to='/'>&#8592; Go Home</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default About;
