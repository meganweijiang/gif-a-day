import React, { Component } from 'react';

class Content extends Component {
  render() {
    return (
      <div>
        { this.props.isHome ? 
          (<p>Love cats? Sign up for the mailing list and get a cat GIF sent to you daily at 8 am CT.</p>) 
          : 
          (<p>We're sad to see you go! The kitties will be waiting for you to come back :(</p>) }
      </div>
    );
  }
}

export default Content;
