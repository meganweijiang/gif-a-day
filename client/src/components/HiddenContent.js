import React from 'react';

const HiddenContent = (props) => (
  <div className="hidden-content">
    { props.loading ? 
      <div id="loading"></div>
      :
      <p id="message">{props.message}</p>
    }
  </div>
)

export default HiddenContent;