import React, { Component } from "react"
import { Link } from "react-router-dom"
import Content from "./Content"
import Form from "./Form"

class Unsubscribe extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: this.props.directEmail || "",
      message: "",
      timeout: null,
      loading: false
    }
  }

  componentWillUnmount = () => {
    window.clearTimeout(this.state.timeout)
  }

  updateTimeout = message => {
    this.setState({ email: "", message, loading: false })
    window.clearTimeout(this.state.timeout)
    let timeout = window.setTimeout(() => {
      this.setState({ message: "" })
    }, 3000)
    this.setState({ timeout })
  }

  handleErrors = res => {
    if (!res.ok && res.status !== 404) {
      this.updateTimeout(`An error has occurred: ${res.statusText}`)
      throw Error(res.statusText)
    }
    return res
  }

  handleChange = e => {
    const prop = e.target.id
    this.setState({ [prop]: e.target.value })
  }

  handleSubmit = async e => {
    e.preventDefault()
    this.setState({ loading: true, message: "" })
    const email = this.state.email
    fetch(`/api/${email}`)
      .then(this.handleErrors)
      .then(res => {
        if (res.status === 404) {
          return this.updateTimeout(
            `${email} does not exist on the mailing list.`
          )
        }
        return res.json().then(res => {
          let key = Object.keys(res)[0]
          let active = res[key].active
          if (active) {
            fetch(`/api/unsubscribe`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ key })
            })
              .then(this.handleErrors)
              .then(() => {
                this.updateTimeout(`${email} has been unsubscribed.`)
              })
          } else {
            this.updateTimeout(`${email} does not exist on the mailing list.`)
          }
        })
      })
      .catch(error => console.log(error))
  }

  render() {
    return (
      <div className="App">
        <div className="outer">
          <div className="container">
            <header className="App-header">
              <h1>Unsubscribe</h1>
            </header>
            <Content isHome={false} />
            <Form
              isHome={false}
              handleSubmit={this.handleSubmit}
              handleChange={this.handleChange}
              email={this.state.email}
              message={this.state.message}
              timeout={this.state.timeout}
              loading={this.state.loading}
            />
            <p className="go-home">
              Looking to sign up or change your mailing preferences?
            </p>
            <Link className="go-home" to="/">
              &#8592; Go Home
            </Link>
          </div>
        </div>
        <Link className="about" to="/about">
          About &#8594;
        </Link>
      </div>
    )
  }
}

export default Unsubscribe
