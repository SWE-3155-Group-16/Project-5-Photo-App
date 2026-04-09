import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React component of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: '',
      user: null
    };
  }

  componentDidMount() {
    this.loadVersion();
    this.loadUserIfNeeded();
  }

  componentDidUpdate(prevProps) {
    const oldUserId = prevProps.match?.params?.userId;
    const newUserId = this.props.match?.params?.userId;

    if (oldUserId !== newUserId) {
      this.loadUserIfNeeded();
    }

    const oldPath = prevProps.location?.pathname;
    const newPath = this.props.location?.pathname;

    if (oldPath !== newPath) {
      this.loadUserIfNeeded();
    }
  }

  loadVersion() {
    fetch('/test/info')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch version info');
        }
        return response.json();
      })
      .then((data) => {
        this.setState({ version: data.__v || '' });
      })
      .catch(() => {
        this.setState({ version: '' });
      });
  }

  loadUserIfNeeded() {
    const userId = this.props.match?.params?.userId;

    if (!userId) {
      this.setState({ user: null });
      return;
    }

    fetch(`/user/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        return response.json();
      })
      .then((data) => {
        this.setState({ user: data });
      })
      .catch(() => {
        this.setState({ user: null });
      });
  }

  getContextText() {
    const { user } = this.state;
    const pathname = this.props.location?.pathname || '';

    if (!user) {
      return '';
    }

    const fullName = `${user.first_name} ${user.last_name}`;

    if (pathname.startsWith('/photos/')) {
      return `Photos of ${fullName}`;
    }

    if (pathname.startsWith('/users/')) {
      return fullName;
    }

    return '';
  }

  render() {
    const { version } = this.state;
    const contextText = this.getContextText();

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className="topbar-toolbar">
          <Typography variant="h6" color="inherit">
            PhotoShare Team
          </Typography>

          <div className="topbar-right">
            {contextText && (
              <Typography variant="h6" color="inherit">
                {contextText}
              </Typography>
            )}

            {version && (
              <Typography variant="body1" color="inherit">
                Version: {version}
              </Typography>
            )}
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;