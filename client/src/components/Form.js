import React from "react"
import HiddenContent from "./HiddenContent"
import SubmitButton from "./SubmitButton"
import Input from "./Input"

const validateEmail = email => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

const Form = props => (
  <div>
    <form>
      {props.isHome && (
        <div className="select-container">
          <span className="select-text">I would like a&nbsp;</span>
          <select id="type" onChange={props.handleChange}>
            {props.types.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          <span className="select-text">&nbsp;GIF everyday.</span>
        </div>
      )}
      <Input handleChange={props.handleChange} email={props.email} />
      <SubmitButton
        handleSubmit={props.handleSubmit}
        validateEmail={validateEmail}
        email={props.email}
      />
    </form>
    <HiddenContent message={props.message} loading={props.loading} />
  </div>
)

export default Form
