import React from 'react';
import './loginRegister.css';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loginName: '',
      password: '',
      registerLoginName: '',
      registerPassword: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      location: '',
      description: '',
      occupation: '',
      error: '',
      successMessage: ''
    };

    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
  }

  clearRegisterFields() {
    this.setState({
      registerLoginName: '',
      registerPassword: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      location: '',
      description: '',
      occupation: ''
    });
  }

  async handleLoginSubmit(e) {
    e.preventDefault();

    const { loginName, password } = this.state;

    this.setState({
      error: '',
      successMessage: ''
    });

    if (loginName.trim() === '' || password.trim() === '') {
      this.setState({
        error: 'Please enter both login name and password.'
      });
      return;
    }

    try {
      const res = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login_name: loginName.trim(),
          password: password.trim()
        })
      });

      if (res.ok) {
        const user = await res.json();

        this.setState({
          loginName: '',
          password: ''
        });

        if (this.props.onLogin) {
          this.props.onLogin(user);
        }

        if (this.props.history) {
          this.props.history.push(`/users/${user._id}`);
        }
      } else {
        const errorText = await res.text();
        this.setState({
          error: errorText || 'Invalid login name or password.'
        });
      }
    } catch (err) {
      this.setState({
        error: 'Login failed.'
      });
    }
  }

  async handleRegisterSubmit(e) {
    e.preventDefault();

    const {
      registerLoginName,
      registerPassword,
      confirmPassword,
      firstName,
      lastName,
      location,
      description,
      occupation
    } = this.state;

    this.setState({
      error: '',
      successMessage: ''
    });

    if (
      registerLoginName.trim() === '' ||
      registerPassword.trim() === '' ||
      confirmPassword.trim() === '' ||
      firstName.trim() === '' ||
      lastName.trim() === ''
    ) {
      this.setState({
        error: 'Please fill in all required registration fields.'
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      this.setState({
        error: 'Passwords do not match.'
      });
      return;
    }

    try {
      const res = await fetch('/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login_name: registerLoginName.trim(),
          password: registerPassword.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          location: location.trim(),
          description: description.trim(),
          occupation: occupation.trim()
        })
      });

      if (res.ok) {
        this.clearRegisterFields();
        this.setState({
          successMessage: 'Registration successful. Please log in.'
        });
      } else {
        const errorText = await res.text();
        this.setState({
          error: errorText || 'Registration failed.'
        });
      }
    } catch (err) {
      this.setState({
        error: 'Registration failed.'
      });
    }
  }

  render() {
    const {
      loginName,
      password,
      registerLoginName,
      registerPassword,
      confirmPassword,
      firstName,
      lastName,
      location,
      description,
      occupation,
      error,
      successMessage
    } = this.state;

    return (
      <div className="login-register-container">
        <h2>Please Login</h2>

        {error !== '' && <p className="login-register-error">{error}</p>}
        {successMessage !== '' && (
          <p className="login-register-success">{successMessage}</p>
        )}

        <div className="login-section">
          <h3>Login</h3>
          <form onSubmit={this.handleLoginSubmit}>
            <input
              type="text"
              placeholder="Login Name"
              value={loginName}
              onChange={(e) => this.setState({ loginName: e.target.value })}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => this.setState({ password: e.target.value })}
            />

            <button type="submit">Login</button>
          </form>
        </div>

        <div className="register-section">
          <h3>Register New User</h3>
          <form onSubmit={this.handleRegisterSubmit}>
            <input
              type="text"
              placeholder="Login Name"
              value={registerLoginName}
              onChange={(e) =>
                this.setState({ registerLoginName: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) =>
                this.setState({ registerPassword: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                this.setState({ confirmPassword: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => this.setState({ firstName: e.target.value })}
            />

            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => this.setState({ lastName: e.target.value })}
            />

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => this.setState({ location: e.target.value })}
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => this.setState({ description: e.target.value })}
            />

            <input
              type="text"
              placeholder="Occupation"
              value={occupation}
              onChange={(e) => this.setState({ occupation: e.target.value })}
            />

            <button type="submit">Register Me</button>
          </form>
        </div>
      </div>
    );
  }
}

export default LoginRegister;