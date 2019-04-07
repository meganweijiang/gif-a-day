import React from 'react';

const SubmitButton = (props) => (
  <div className="submit-button clearfix">
    { !props.validateEmail(props.email) && props.email !== '' && <div className="invalid">Please enter a valid email address.</div> }
    <button onClick={props.handleSubmit} disabled={!props.validateEmail(props.email)}>Submit</button>
  </div>
)

export default SubmitButton;