# Slack-jukebox

## Introduction
* Collaborative playlist from youtube videos.
* Handle like/dislike.

## Requirements
* NodeJs
* npm
* vlc ^2.2 (In path for windows users)
* a token bot in Slack https://api.slack.com/bot-users

## Installation
Clone repo:
<pre>
 git clone https://github.com/lucbu/slack-jukebox.git
</pre>

Install dependencies:
<pre>
 npm install
</pre>

Set config parameters in config.js:
<pre>
var config = {};

config.slack_token = "BOT-TOKEN"; // The auth token of the bot
config.slack_channels = []; // Array of channel where djbot is present and where he can handle answers
config.dl_folder = 'music/';
config.samples_folder = 'samples/';

module.exports = config;
</pre>

Launch app:
<pre>
  node app.js
</pre>

## Commands
* @BOT-ID add http://link.to.youtube.video
* @BOT-ID playing
* @BOT-ID playlist
* @BOT-ID playnext
* @BOT-ID play
* @BOT-ID pause
* @BOT-ID volume up
* @BOT-ID volume down
* @BOT-ID volume X (0<X<100)
* @BOT-ID volume X (0<X<100)

## New commands
* @BOT-ID install [Youtube URL] [Sound's ID (a-z0-9_)] [Start 00:00] [End 00:00] - Start and End are optional',
* @BOT-ID list',
* @BOT-ID send [Sound's ID]',
* @BOT-ID uninstall [Sound's ID] [Password]',
* @BOT-ID help'

## TODO
* democratic playnext
* full integration with VLC interface RC?
* refactor code
