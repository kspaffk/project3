import React, { Component } from "react";
import { Router, Route, Redirect } from "react-router-dom";
import axios from "axios";
import history from "./utils/history";
import Home from "./Home";
import Profile from "./Profile";
import GiftLists from "./pages/GiftLists";
import GiftGiverList from "./GiftGiverList";
import GiveGifts from "./pages/GiveGifts";
import Login from "./pages/Login";
import Nav from "./components/Nav";
import Auth from "./Auth/Auth";
import Callback from "./Callback";
import Header from "./components/Header";
import "./App.css";

class App extends Component {
  constructor(props) {
    // ES6 class constructors MUST call super if they are subclasses. Thus, you have to call super() as long as you have a constructor.
    // Call super(props) only if you want to access this.props inside the constructor. React automatically set it for you if you want to access it anywhere else. The effect of passing props when calling super() allows you to access this.props in the constructor:
    super(props);
    this.auth = new Auth(history);
    this.state = { user: null };
    this.getOrCreateDBUser = this.getOrCreateDBUser.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
  }

  componentDidMount() {
    console.log("did mount");
    console.log(localStorage.getItem("access_token"));
    console.log(`This app state user: ${this.state.user}`);
    setTimeout(() => {
      if (this.auth.isAuthenticated()) {
        this.getOrCreateDBUser();
      }
    }, 500);
  }

  getOrCreateDBUser() {
    if (this.auth.userProfile) {
      if (
        this.state.user &&
        this.auth.userProfile.email !== this.state.user.email
      )
        console.log(this.auth.userProfile);
      axios
        .post("/api/user", { email: this.auth.userProfile.email })
        .then(dbUser => {
          this.setState({ user: dbUser.data });
          console.log("DBCALL");
          console.log(localStorage.getItem("access_token"));
          console.log(`This app state user: ${JSON.stringify(this.state.user.email)}`);
        });
    }
  }

  updateUserInfo() {
    axios
      .post("/api/user", { email: this.state.user.email })
      .then(dbUser => this.setState({ user: dbUser.data }));
  }

  render() {
    return (
      <Router history={history}>
        <Header />
        <Nav auth={this.auth} user={this.state.user} />
        <Route
          path="/"
          exact
          render={props =>
            !this.auth.isAuthenticated() ? (
              <Login auth={this.auth} />
            ) : (
              <>
                <Home auth={this.auth} {...props} />
              </>
            )
          }
        />
        <Route
          path="/profile"
          render={props =>
            this.auth.isAuthenticated() ? (
              <Profile auth={this.auth} user={this.state.user} {...props} />
            ) : (
              <Redirect to="/" />
            )
          }
        />
        <Route
          path="/lists"
          render={props => (
            <GiftLists
              user={this.state.user}
              updateUserInfo={this.updateUserInfo}
            />
          )}
        />
        <Route
          path="/give"
          render={props => (
            <GiveGifts
              user={this.state.user}
              updateUserInfo={this.updateUserInfo}
            />
          )}
        />
        <Route
          path="/mngGivers"
          render={props => <GiftGiverList auth={this.auth} {...props} />}
        />
        <Route
          path="/login"
          render={props => <Login auth={this.auth} {...props} />}
        />
        <Route
          path="/callback"
          render={props => <Callback auth={this.auth} {...props} />}
        />
      </Router>
    );
  }
}

export default App;
