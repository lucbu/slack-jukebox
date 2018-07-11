var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var config = require('./config.js');
var Helper = require('./Helper.js');
var helper = new Helper();


function SlackConnector(command_handler) {
    this.command_handler = command_handler;
    var bot_token = config.slack.token;
    var channels = 'undefined' !== typeof config.slack.channels ? config.slack.channels : [];
    var aliases = 'undefined' !== typeof config.slack.aliases ? config.slack.aliases : {};
    var rtm = new RtmClient(bot_token);
    var id = undefined;
    var logtime = undefined;
    var followed_items = {};

    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
        console.log('Logged in as '+rtmStartData.self.name+' of team '+rtmStartData.team.name+', but not yet connected to a channel');
        id = rtmStartData.self.id;
    });

    // wait 3sec for not getting last message
    setTimeout(function() {
        rtm.on(RTM_EVENTS.MESSAGE, function (message) {
            //console.log(message)
            if (channels.length == 0 || channels.indexOf(message.channel) != -1) {
                // The prefix is the bot's id
                var prefix = '<@'+id+'>';

                if ('undefined' === typeof message.subtype && 'undefined' !== typeof message.text) {
                    var text = message.text;
                } else if ('undefined' !== typeof message.previous_message && 'undefined' !== typeof message.previous_message.text) {
                    text = message.previous_message.text;
                }


                var botReply = function(msgToSend) {
                    rtm.sendMessage(msgToSend, message.channel);
                };

                if ('undefined' !== typeof text && text.startsWith(prefix)) {
                    // Getting the command in good shape
                    var command = text.substr(prefix.length, (text.length - prefix.length)).trim();
                    // Check if their is alias
                    command = 'undefined' !== typeof aliases[command] ? aliases[command] : command;


                    if (command.startsWith('install') && 'undefined' === typeof message.subtype) {
                        var argsInstall = command.split('install ').pop().split(' ');

                        if (argsInstall.length >= 2) {
                            var url = argsInstall[0].replace('<','').replace('>','');
                            var sampleIdToInstall = argsInstall[1];

                            if (sampleIdToInstall.match(/^([a-zA-Z0-9_]{2,})$/)) {

                                if (argsInstall.length == 4) {
                                    var startAt = argsInstall[2];
                                    var endAt = argsInstall[3];

                                    if (startAt.match(/^([0-9]{2}):([0-9]{2})$/) && endAt.match(/^([0-9]{2}):([0-9]{2})$/)) {
                                        command_handler.updateSample(url, sampleIdToInstall, {start: startAt, end: endAt}, botReply);
                                    }
                                } else {
                                    command_handler.updateSample(url, sampleIdToInstall, null, botReply);
                                }
                            }
                        }

                    } else if (command.startsWith('uninstall') && 'undefined' === typeof message.subtype) {
                        var argsUninstall = command.split('uninstall ').pop().split(' ');

                        if (argsUninstall.length == 2) {
                            var sampleIdToUninstall = argsUninstall[0];
                            var softpassword = argsUninstall[1];

                            if (softpassword == 'jierluc') {
                                command_handler.deleteSample(sampleIdToUninstall, botReply);
                            }
                        }

                    }  else if (command.startsWith('send') && 'undefined' === typeof message.subtype) {
                        var argsPlay = command.split('send ').pop().split(' ');

                        if (argsPlay.length == 1) {
                            var sampleIdToPlay = argsPlay[0];
                            command_handler.playSample(sampleIdToPlay, 'slack', message.user, function() {

                            });
                        }

                    } else if (command.startsWith('list') && 'undefined' === typeof message.subtype) {
                        command_handler.listSamples(botReply);
                    }  else if (command.startsWith('help') && 'undefined' === typeof message.subtype) {
                        command_handler.helpForSamples(botReply);
                    } else if (command.startsWith('add') && 'undefined' === typeof message.subtype) {
                        var urls = command.split(' add ').pop().split(' ');
                        urls.forEach(function(value) {
                            var url = value.replace('<','').replace('>','');
                            // ########## ADD ##########
                            item = command_handler.addUrlToPlaylist(
                                url,
                                'slack',
                                message.user,
                                function() {
                                    if ('undefined' !== followed_items[message.ts]) {
                                        if (followed_items[message.ts].length > 0) {
                                        } else {
                                            delete followed_items[message.ts];
                                        }
                                    }
                                }
                            );
                            if ('undefined' !== typeof item && null != item) {
                                if ('undefined' === typeof followed_items[message.ts]) {
                                    followed_items[message.ts] = []
                                }
                                followed_items[message.ts].push(item);
                            }
                        })
                    } else if (command == 'play' && 'undefined' === typeof message.subtype) {
                        command_handler.play();
                    } else if (command == 'pause' && 'undefined' === typeof message.subtype) {
                        command_handler.pause();
                    } else if (command.startsWith('volume ') && 'undefined' === typeof message.subtype) {
                        command_handler.volume(command.split(' ').pop());
                    } else if (command.startsWith('playing') && 'undefined' === typeof message.subtype) {
                        // ########## CURRENT ##########
                        if ('undefined' !== typeof command_handler.playlist.playing) {
                            rtm.sendMessage("The music currently playing is ''" + command_handler.playlist.playing.sound.title+"'. [" + helper.hmsTimeFormat(item.sound.length) + "]", message.channel);
                        } else {
                            rtm.sendMessage("No music playing (Set a music with the command 'add')", message.channel);
                        }
                    } else if (command.startsWith('playlist') && 'undefined' === typeof message.subtype) {
                        // ########## PLAYLIST ##########
                        if (command_handler.playlist.queue.length > 0) {
                            rtm.sendMessage( 'Total Length : [' + helper.hmsTimeFormat(command_handler.playlist.totalLength()) + ']\n' +
                                command_handler.playlist.queue.map(function(item) {
                                    return ' - ' + item.sound.title + ' (:+1:='+item.like+' / :-1:='+item.dislike+')' + '[' + helper.hmsTimeFormat(item.sound.length) + ']' + ' by <@'+item.user_id+ '>';
                                }).join('\n'),
                                message.channel
                            );
                        } else {
                            rtm.sendMessage("No playlist set (Set a music with the command 'add')", message.channel);
                        }
                    } else if (command.startsWith('playnext') && 'undefined' === typeof message.subtype) {
                        command_handler.playNext();
                    } else if ('undefined' !== typeof message.subtype && 'message_deleted' == message.subtype) {
                        if (message.previous_message.ts in followed_items) {
                            command_handler.deleteFromPlaylist(followed_items[message.previous_message.ts], function() {
                                delete followed_items[message.ts];
                            })
                        }
                    } else {
                        var argsPlay = command.split(' ').pop();
                        command_handler.playSample(argsPlay, 'slack', message.user, function() {});
                    }
                }
            }
        })
    }, 3000);

    rtm.on(RTM_EVENTS.REACTION_ADDED, function (reaction) {
        if (reaction.item.type == 'message') {
            if (reaction.item.ts in followed_items) {
                if (reaction.reaction == '+1') {
                    command_handler.addLike(followed_items[reaction.item.ts]);
                } else if (reaction.reaction == '-1') {
                    command_handler.addDislike(followed_items[reaction.item.ts]);
                }
            }
        }
    });
    rtm.on(RTM_EVENTS.REACTION_REMOVED, function (reaction) {
        if (reaction.item.type == 'message') {
            if (reaction.item.ts in followed_items) {
                if (reaction.reaction == '+1') {
                    command_handler.removeLike(followed_items[reaction.item.ts]);
                } else if (reaction.reaction == '-1') {
                    command_handler.removeDislike(followed_items[reaction.item.ts]);
                }
            }
        }
    });

    rtm.start(false);
}

module.exports = SlackConnector;
