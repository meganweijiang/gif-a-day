import React from 'react';

const SubmitButton = (props) => (
  <button onClick={props.handleSubmit} className="clearfix" disabled={!props.email}>Submit</button>
)

export default SubmitButton;