import React from 'react';
import {
  Typography,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import './userDetail.css';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null
    };
  }

  componentDidMount() {
    this.loadUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.loadUser();
    }
  }

  loadUser() {
    const userId = this.props.match.params.userId;

    fetch(`/user/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        return response.json();
      })
      .then((data) => {
        this.setState({ user: data, error: null });
      })
      .catch((error) => {
        this.setState({ error: error.message, user: null });
      });
  }

  render() {
    const { user, error } = this.state;

    if (error) {
      return (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      );
    }

    if (!user) {
      return (
        <Typography variant="body1">
          Loading user details...
        </Typography>
      );
    }

    return (
      <div className="user-detail-container">
        <Typography variant="h4" gutterBottom>
          {user.first_name} {user.last_name}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>First name:</strong> {user.first_name}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Last name:</strong> {user.last_name}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Location:</strong> {user.location}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Description:</strong> {user.description}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <strong>Occupation:</strong> {user.occupation}
        </Typography>

        <Button
          component={Link}
          to={`/photos/${user._id}`}
          variant="contained"
          sx={{ mt: 2 }}
        >
          View Photos
        </Button>
      </div>
    );
  }
}

export default UserDetail;