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

module.exports = config;
</pre>

## Commands
* @BOT-ID add http://link.to.youtube.video
* @BOT-ID playing
* @BOT-ID playlist
* @BOT-ID playnext

## TODO
* democratic playnext
* refactor code