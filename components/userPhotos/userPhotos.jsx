import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import FetchModel from "../../lib/fetchModelData";
import "./userPhotos.css";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.loadPhotos();
  }

  componentDidUpdate(prevProps) {
    const userChanged = prevProps.match.params.userId !== this.props.match.params.userId;
    // refreshKey incremented by parent after a successful upload
    const refreshed = prevProps.refreshKey !== this.props.refreshKey;
    if (userChanged || refreshed) {
      this.loadPhotos();
    }
  }

  loadPhotos() {
    const { userId } = this.props.match.params;
    this.setState({ loading: true, error: null });

    FetchModel(`/photosOfUser/${userId}`)
      .then((result) => {
        this.setState({ photos: result.data, loading: false });
      })
      .catch((err) => {
        this.setState({
          error: `Error ${err.status}: ${err.statusText}`,
          loading: false,
        });
      });
  }

  formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  render() {
    const { photos, loading, error } = this.state;

    if (loading) {
      return (
        <Box className="up-status-box">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading photos…
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box className="up-status-box">
          <Typography color="error" variant="body1">
            {error}
          </Typography>
        </Box>
      );
    }

    if (!photos || photos.length === 0) {
      return (
        <Box className="up-status-box">
          <Typography variant="body1" color="text.secondary">
            This user has no photos yet.
          </Typography>
        </Box>
      );
    }

    return (
      <div className="up-root">
        {photos.map((photo) => (
          <Card key={photo._id} className="up-photo-card" elevation={2}>

            <CardMedia
              component="img"
              image={`/images/${photo.file_name}`}
              alt={photo.file_name}
              className="up-photo-img"
            />

            <CardContent className="up-photo-content">
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                className="up-photo-date"
              >
                {this.formatDate(photo.date_time)}
              </Typography>

              {photo.comments && photo.comments.length > 0 ? (
                <div className="up-comments-container">
                  <Typography variant="subtitle2" className="up-comments-heading">
                    {photo.comments.length === 1
                      ? "1 Comment"
                      : `${photo.comments.length} Comments`}
                  </Typography>

                  {photo.comments.map((comment, idx) => (
                    <div key={comment._id || idx}>
                      {idx > 0 && <Divider className="up-comment-divider" />}
                      <div className="up-comment">
                        <div className="up-comment-header">
                          <Typography
                            variant="subtitle2"
                            component={Link}
                            to={`/users/${comment.user._id}`}
                            className="up-comment-author"
                          >
                            {comment.user.first_name} {comment.user.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {this.formatDate(comment.date_time)}
                          </Typography>
                        </div>
                        <Typography variant="body2" className="up-comment-text">
                          {comment.comment}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  No comments on this photo.
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}

export default UserPhotos;
