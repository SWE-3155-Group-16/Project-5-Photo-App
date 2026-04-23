import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@mui/material';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './src/components/LoginRegister/LoginRegister';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: null
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogin(user) {
    this.setState({
      currentUser: user
    });
  }

  handleLogout() {
    this.setState({
      currentUser: null
    });
  }

  render() {
    const { currentUser } = this.state;

    return (
      <HashRouter>
        <div>
          <TopBar currentUser={currentUser} onLogout={this.handleLogout} />
          <div className="main-topbar-buffer" />
          <Grid container spacing={2} style={{ padding: '16px' }}>
            <Grid item xs={12} sm={3}>
              <Paper className="main-grid-item">
                {currentUser ? <UserList /> : null}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Paper className="main-grid-item">
                <Switch>
                  <Route
                    exact
                    path="/login-register"
                    render={(props) => (
                      <LoginRegister {...props} onLogin={this.handleLogin} />
                    )}
                  />

                  <Route
                    exact
                    path="/"
                    render={() => (
                      currentUser ? (
                        <Typography variant="body1">
                          Welcome to your photosharing app!
                        </Typography>
                      ) : (
                        <Redirect to="/login-register" />
                      )
                    )}
                  />

                  <Route
                    path="/users/:userId"
                    render={(props) => (
                      currentUser ? (
                        <UserDetail {...props} />
                      ) : (
                        <Redirect to="/login-register" />
                      )
                    )}
                  />

                  <Route
                    path="/photos/:userId"
                    render={(props) => (
                      currentUser ? (
                        <UserPhotos {...props} />
                      ) : (
                        <Redirect to="/login-register" />
                      )
                    )}
                  />

                  <Route
                    path="/users"
                    render={() => (
                      currentUser ? <UserList /> : <Redirect to="/login-register" />
                    )}
                  />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);