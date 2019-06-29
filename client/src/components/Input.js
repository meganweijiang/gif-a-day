import React from "react"

const Input = props => (
  <div>
    <label className="clearfix" htmlFor="email">
      Email Address
    </label>
    <input
      id="email"
      type="email"
      name="email"
      value={props.email}
      onChange={props.handleChange}
    />
  </div>
)

export default Input
