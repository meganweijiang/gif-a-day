import React, { Component } from "react"
import { Link } from "react-router-dom"
import "../styles/App.scss"
import Form from "./Form"
import Content from "./Content"

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      type: "",
      types: [],
      message: "",
      timeout: null,
      loading: false
    }
  }

  componentDidMount = () => {
    fetch(`/api/types`)
      .then(this.handleErrors)
      .then(res => {
        return res.json()
      })
      .then(types => {
        this.setState({ types, type: types[0] })
      })
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

  handleChange = e => {
    const prop = e.target.id
    this.setState({ [prop]: e.target.value })
  }

  handleErrors = res => {
    if (!res.ok && res.status !== 404) {
      this.updateTimeout(`An error has occurred: ${res.statusText}`)
      throw Error(res.statusText)
    }
    return res
  }

  handleSubmit = e => {
    e.preventDefault()
    this.setState({ loading: true, message: "" })
    const email = this.state.email
    const type = this.state.type
    let status = ""
    fetch(`/api/${email}`)
      .then(this.handleErrors)
      .then(res => {
        status = res.status
        return res.json()
      })
      .then(res => {
        if (status === 404) {
          fetch("/api/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, type })
          })
            .then(this.handleErrors)
            .then(() => {
              this.updateTimeout(`${email} has been added to the mailing list!`)
            })
        } else {
          const key = Object.keys(res)[0]
          const active = res[key].active
          const currentType = res[key].type
          if (active === 1) {
            if (currentType !== type) {
              fetch("/api/update", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ key, type })
              })
                .then(this.handleErrors)
                .then(() => {
                  this.updateTimeout(
                    `Mailing preferences for ${email} have been updated.`
                  )
                })
            } else {
              this.updateTimeout(`${email} is already on the mailing list.`)
            }
          } else {
            fetch("/api/update", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ key, type })
            })
              .then(this.handleErrors)
              .then(() => {
                this.updateTimeout(
                  `Welcome back to the mailing list, ${email}!`
                )
              })
          }
        }
      })
      .catch(error => console.log(error))
  }

  render() {
    return (
      <div className="App">
        <div className="outer">
          <div className="container">
            <header className="App-header">
              <h1>GIF a Day</h1>
            </header>
            <Content isHome={true} />
            <Form
              isHome={true}
              handleSubmit={this.handleSubmit}
              handleChange={this.handleChange}
              email={this.state.email}
              message={this.state.message}
              timeout={this.state.timeout}
              loading={this.state.loading}
              types={this.state.types}
            />
            <p className="unsub">
              Need to <Link to="/unsubscribe">unsubscribe</Link>?
            </p>
          </div>
        </div>
        <Link className="about" to="/about">
          About &#8594;
        </Link>
      </div>
    )
  }
}

export default App
