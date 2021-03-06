var mongoose = require('mongoose'),
    Topic = mongoose.model('Topic'),
    Post = mongoose.model('Post'),
    Comment = mongoose.model('Comment'),
    User = mongoose.model('User')

module.exports = {
  findAll: function(req, res){ //for the dashboard partial and statistics at the bottom of said partial
    User.find({}, function(err, users){
      Topic.find({}).populate('posts').exec(function(err, topics){
        Post.find({}, function(err, posts){
          Comment.find({}, function(err, comments){
            res.json({users: users, topics: topics, posts: posts, comments: comments})
          })
        })
      })
    })
  }, //END OF FINDALL********

  findOne: function(req, res){
    Topic.findOne({_id: req.params.id}).populate({path: 'posts', populate: {path: 'comments'}}).exec(function(err, topic){
      res.json(topic)
    })
  },

  findCategory: function(req, res){
    Topic.find({category: req.params.name}).populate('posts').exec( function(err, topics){
      res.json(topics)
    })
  },

  create: function(req, res){
    if(!req.session.user){ // then they aren't logged in
      return res.json({message: false, str: 'You must be logged in to create a new topic'})
    }
    var categories = ['Consoles', 'Retro Gaming', 'News', 'Upcoming Games/Tech', 'Specific Series', 'Specific Game', 'PC', 'Indie', 'Handheld', 'Collecting', 'Conventions and Events', 'Other']
    var check = categories.includes(req.body.category)
    if(!check){ //A simple check to make sure that they entered a pre-determined category, wouldn't cause any serious damage and could be deleted, but better to stop small-scale tampering like that before it happens.
      return res.json({message: false, str: 'That category is not in the database'})
    }
    var topic = new Topic(req.body)
    topic.username = req.session.user.username
    topic.userId = req.session.user._id
    topic.adminFlag = false
    topic.userFlag = false
    topic.save(function(err){
      if(err){
        console.log(err)
        res.json({message: false, str: 'There was an error'})
      } else{
        res.json({message: true})
      }
    })
  }, //END OF CREATE*************

  delete: function(req, res){
    Topic.findOne({_id: req.params.id}, function(err, topic){
      if(req.session.user._id != topic.userId && !req.session.user.admin_status){ //if this doesn't pass then the user either created the topic or is an admin and can delete it. If this does pass then the user probably manipulated the client side and is trying to delete a topic they didn't create and they're not an admin
        console.log('Not correct user Id');
        res.json({message: false})
      } else{
        topic.remove() //I have to do findOne and then this because if I just use remove, my Schema.pre methods in my models don't activate. I have .pre methods to cascade delete both any related posts and comments
        res.json({message: true})
      }
    })
  },

  flag: function(req, res){
    if(!req.session.user)
      return res.json({message: false, str: 'You must be logged in to flag a topic'})
    Topic.update({_id: req.params.id}, {$set: {adminFlag: true}}, function(err){
      res.json({message: true})
    })
  }

}



// *******************End*******************
