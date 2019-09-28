import React, { Component } from "react"
import { CSSTransition } from "react-transition-group"
import moment from "moment-timezone"
import jstz from "jstz"
import cat from "../images/main.gif"

class Content extends Component {
  constructor(props) {
    super(props)
    this.state = {
      _loaded: false
    }
  }

  componentDidMount = () => {
    this.setState({ _loaded: true })
  }

  componentDidMount = () => {
    if (!sessionStorage.getItem("timezone")) {
      const tz = jstz.determine() || "UTC"
      sessionStorage.setItem("timezone", tz.name())
    }
    const currTz = sessionStorage.getItem("timezone")
    const date = moment.utc().set({ h: 13, m: 0 })
    const tzTime = date.tz(currTz)
    const formattedTime = tzTime.format("h:mm A")
    this.setState({ time: formattedTime })
  }

  render() {
    return (
      <div className="content">
        <CSSTransition
          in={this.state._loaded}
          timeout={500}
          classNames="cat-gif"
        >
          <img src={cat} alt="" />
        </CSSTransition>
        {this.props.isHome ? (
          <p>
            Love cats or dogs? Sign up for the mailing list and get a cat or dog
            GIF sent to you daily at {this.state.time}.
          </p>
        ) : (
          <p>
            We're sad to see you go! The furbabies will be waiting for your
            return &#9785;
          </p>
        )}
      </div>
    )
  }
}

export default Content
