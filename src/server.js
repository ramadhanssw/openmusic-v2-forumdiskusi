require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const albums = require('./api/albums');
const { AlbumsService } = require('./services/postgres/AlbumsService');
const { AlbumsValidator } = require('./validator/albums');

const songs = require('./api/songs');
const { SongsService } = require('./services/postgres/SongsService');
const { SongsValidator } = require('./validator/songs');

const authentications = require('./api/authentications');
const { AuthenticationsService } = require('./services/postgres/AuthenticationsService');
const { TokenManager } = require('./tokenize/TokenManager');
const { AuthenticationsValidator } = require('./validator/authentications');

const users = require('./api/users');
const { UsersService } = require('./services/postgres/UsersService');
const { UsersValidator } = require('./validator/users');

const playlists = require('./api/playlists');
const { PlaylistsService } = require('./services/postgres/PlaylistsService');
const { PlaylistsValidator } = require('./validator/playlists');

const playlistsongs = require('./api/playlistsongs');
const { PlaylistsongsService } = require('./services/postgres/PlaylistsongsService');
const { PlaylistsongsValidator } = require('./validator/playlistsongs');

const collaborations = require('./api/collaborations');
const { CollaborationsService } = require('./services/postgres/CollaborationsService');
const { CollaborationsValidator } = require('./validator/collaborations');

const init = async () => {
  const albumsService = new AlbumsService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistsongsService = new PlaylistsongsService();
  const songsService = new SongsService();
  const usersService = new UsersService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('playlistsapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        usersService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistsongs,
      options: {
        playlistsongsService,
        playlistsService,
        validator: PlaylistsongsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
