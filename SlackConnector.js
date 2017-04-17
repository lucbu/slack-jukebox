var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var config = require('./config.js');


function SlackConnector(command_handler) {
  this.command_handler = command_handler;
  var bot_token = config.slack_token;
  var channels = config.slack_channels;
  var rtm = new RtmClient(bot_token);
  var id = undefined;
  var logtime = undefined;
  var followed_items = {};

  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
    id = rtmStartData.self.id;
  });

  // wait 3sec for not getting last message
  setTimeout(function(){
    rtm.on(RTM_EVENTS.MESSAGE, function (message) {
      //console.log(message)
      if(channels.length == 0 || channels.indexOf(message.channel) != -1){
        // The prefix is the bot's id
        var prefix = '<@'+id+'>';
        if(('undefined' === typeof message.subtype)){
          var text = message.text;
        } else {
          text = message.previous_message.text;
        }
        if ('undefined' !== typeof text && text.startsWith(prefix)) {
          // Getting the command in good shape
          var command = text.substr(prefix.length, (text.length - prefix.length)).trim();

          if (command.startsWith('add')){
            if('undefined' === typeof message.subtype){
            // ########## ADD ##########
            item = command_handler.addUrlToPlaylist(
                command.split(' ').pop().replace('<','').replace('>',''),
                'slack',
                message.user,
                function(){
                    if('undefined' !== followed_items[message.ts]){
                      delete followed_items[message.ts];
                    }
                }
              );
            if('undefined' !== typeof item){
              followed_items[message.ts] = item;
            }
          } else if ('message_deleted' == message.subtype) {
            command_handler.deleteFromPlaylist(followed_items[message.previous_message.ts], function(){
                delete followed_items[message.ts];
            })
          }
        } else if (command.startsWith('lalala') && 'undefined' === typeof message.subtype){
          item = command_handler.addUrlToPlaylist(
              "https://www.youtube.com/watch?v=QoPofJeWuR0",
              'slack',
              message.user,
              function(){
                  if('undefined' !== followed_items[message.ts]){
                    delete followed_items[message.ts];
                  }
              }
            );
          if('undefined' !== typeof item){
            followed_items[message.ts] = item;
          }

        } else if (command.startsWith('playing') && 'undefined' === typeof message.subtype){
            // ########## CURRENT ##########
            if('undefined' !== typeof command_handler.playlist.playing){
              rtm.sendMessage("The music currently playing is ''" + command_handler.playlist.playing.sound.title+"'.", channel);
            } else {
                rtm.sendMessage("No music playing (Set a music with the command 'add')", channel);
            }
          } else if (command.startsWith('playlist') && 'undefined' === typeof message.subtype){
            // ########## PLAYLIST ##########
            if(command_handler.playlist.queue.length > 0){
                rtm.sendMessage(
                  command_handler.playlist.queue.map(function(item) {
                      return ' - ' + item.sound.title + ' (:+1:='+item.like+' / :-1:='+item.dislike+')' + ' by <@'+item.user_id+ '>';
                  }).join('\n'),
                  channel
                );
            } else {
              rtm.sendMessage("No playlist set (Set a music with the command 'add')", channel);
            }
          } else if (command.startsWith('playnext')){
            console.log('force')
            command_handler.playNext();
          }
        }
      }
    })
  }, 3000);

  rtm.on(RTM_EVENTS.REACTION_ADDED, function (reaction) {
    if(reaction.item.type == 'message'){
        if (reaction.item.ts in followed_items){
          if(reaction.reaction == '+1'){
            command_handler.addLike(followed_items[reaction.item.ts]);
          } else if (reaction.reaction == '-1'){
            command_handler.addDislike(followed_items[reaction.item.ts]);
          }
        }
    }
  })
  rtm.on(RTM_EVENTS.REACTION_REMOVED, function (reaction) {
    if(reaction.item.type == 'message'){
      if (reaction.item.ts in followed_items){
        if(reaction.reaction == '+1'){
          command_handler.removeLike(followed_items[reaction.item.ts]);
        } else if (reaction.reaction == '-1'){
          command_handler.removeDislike(followed_items[reaction.item.ts]);
        }
      }
    }
  })

  rtm.start(false);
}

module.exports = SlackConnector;