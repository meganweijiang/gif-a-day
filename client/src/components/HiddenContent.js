import React from 'react';

const HiddenContent = (props) => (
  <div className="hidden-content">
    { props.showMessage && <p id="message">{props.message}</p> }
    { props.loading && <div id="loading"></div> }
  </div>
)

export default HiddenContent;