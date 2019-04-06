import React, { Component } from 'react';
import HiddenContent from './HiddenContent';
import SubmitButton from './SubmitButton';

const Form = (props) => (
  <div>
    <form>
      { 
        props.isHome &&
        (<div className="select-container">
          <span className="select-text">I would like a&nbsp;</span>
          <select id="type" onChange={props.handleChange}>
            <option value="cat">cat</option>
            <option value="dog">dog</option>
          </select>
          <span className="select-text">&nbsp;GIF everyday.</span>
        </div>)
      }
      <label className="clearfix" htmlFor="email">Email Address</label>
      <input id="email" type="email" name="email" value={props.email} onChange={props.handleChange}/>
      <SubmitButton handleSubmit={props.handleSubmit} email={props.email} />
    </form>
    <HiddenContent message={props.message} loading={props.loading} />
  </div>
)

export default Form;