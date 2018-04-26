function PlaylistItem(sound, provider, user_id, endPlaying) {
//  console.log('Create PlaylistItem ('+sound.filename+')');
    this.sound = sound;
    this.like = 0;
    this.dislike = 0;
    this.endPlaying = endPlaying;
    this.provider = provider;
    this.user_id = user_id;
}

module.exports = PlaylistItem;
