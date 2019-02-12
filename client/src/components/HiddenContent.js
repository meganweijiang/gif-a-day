import React from 'react';
import { CSSTransition } from 'react-transition-group';

const HiddenContent = (props) => (
  <div className="hidden-content">
    <CSSTransition
      in={!!props.message}
      timeout={300}
      classNames="hidden-message">
    <p id="message">{props.message}</p>
    </CSSTransition>
    { props.loading && <div id="loading"></div> }
  </div>
)

export default HiddenContent;