const mapDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
  username,
  name,
  owner,
  playlist_id,
  song_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumid: albumId,
  username,
  name,
  owner,
  playlistId: playlist_id,
  songId: song_id,
});

module.exports = { mapDBToModel };
