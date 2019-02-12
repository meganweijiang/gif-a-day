import React, { Component } from 'react';
import cat from '../images/main.gif';
import { CSSTransition } from 'react-transition-group';

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _loaded: false,
    };
  };

  componentDidMount = () => {
    this.setState({ _loaded: true });
  }

  render() {
    return (
      <div className="content">
        <CSSTransition 
          in={this.state._loaded}
          timeout={500}
          classNames="cat-gif">
          <img src={cat} alt="" />
        </CSSTransition>        
        { this.props.isHome ? 
          (<p>Love cats or dogs? Sign up for the mailing list and get a cat or dog GIF sent to you daily at 8 am CT.</p>) 
          : 
          (<p>We're sad to see you go! The furbabies will be waiting for your return &#9785;</p>) }
      </div>
    );
  }
}

export default Content;
