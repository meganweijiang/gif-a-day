import React, { Component } from 'react';
import cat from '../images/main.gif';

class Content extends Component {
  render() {
    return (
      <div className="content">
        <img src={cat} alt="" />
        { this.props.isHome ? 
          (<p>Love cats? Sign up for the mailing list and get a cat GIF sent to you daily at 8 am CT.</p>) 
          : 
          (<p>We're sad to see you go! The kitties will be waiting for your return &#9785;</p>) }
      </div>
    );
  }
}

export default Content;
