import React from 'react';
import {
  Typography,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Box,
  Divider,
} from '@mui/material';
import axios from 'axios';
import './userComments.css';

/**
 * UserComments - displays all comments authored by a specific user.
 * Each entry shows a photo thumbnail and the comment text.
 * Clicking navigates to the photo detail view for that photo.
 */
class UserComments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      user: null,
      userId: undefined,
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    const userId = this.props.match.params.userId;
    this.loadData(userId);
  }

  componentDidUpdate() {
    const userId = this.props.match.params.userId;
    if (userId !== this.state.userId) {
      this.loadData(userId);
    }
  }

  loadData(userId) {
    this.setState({ loading: true, error: null, userId });

    const userReq = axios.get(`/user/${userId}`);
    const commentsReq = axios.get(`/commentsOfUser/${userId}`);

    Promise.all([userReq, commentsReq])
      .then(([userRes, commentsRes]) => {
        const user = userRes.data;
        this.props.changeMainContent
          && this.props.changeMainContent(
              `Comments by ${user.first_name} ${user.last_name}`
            );
        this.setState({
          user,
          comments: commentsRes.data,
          loading: false,
        });
      })
      .catch((err) => {
        console.error(err);
        this.setState({ error: 'Failed to load comments.', loading: false });
      });
  }

  render() {
    const { comments, user, loading, error } = this.state;

    if (loading) {
      return <Typography>Loading...</Typography>;
    }
    if (error) {
      return <Typography color="error">{error}</Typography>;
    }

    return (
      <div className="user-comments-container">
        <Typography variant="h5" gutterBottom>
          Comments by {user ? `${user.first_name} ${user.last_name}` : ''}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {comments.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            This user has not made any comments yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {comments.map((entry) => (
              <Grid item xs={12} key={entry.comment_id}>
                <Card
                  variant="outlined"
                  component="a"
                  href={`#/photos/${entry.photo.owner_id}`}
                  sx={{
                    display: 'flex',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  <CardActionArea
                    component="a"
                    href={`#/photos/${entry.photo.owner_id}`}
                    sx={{ display: 'flex', alignItems: 'stretch', width: '100%' }}
                  >
                    {/* Thumbnail */}
                    <CardMedia
                      component="img"
                      image={`images/${entry.photo.file_name}`}
                      alt="Photo thumbnail"
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />

                    {/* Comment text */}
                    <CardContent sx={{ flex: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          {new Date(entry.date_time).toLocaleString()}
                        </Typography>
                        <Typography variant="body1">
                          {entry.comment}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    );
  }
}

export default UserComments;
