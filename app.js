var Playlist = require('./playlist/Playlist.js');
var Player = require('./player/Player.js');
var SlackConnector = require('./SlackConnector.js');
var CommandHandler = require('./CommandHandler.js');

var player = new Player();
var playlist = new Playlist(player);
var command_handler = new CommandHandler(playlist)
var slack_connector = new SlackConnector(command_handler);
