var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name,title,post){
	this.title = title;
	this.name = name;
	this.post = post;
}

module.exports = Post;

Post.prototype.save = function(callback){
	var date = new Date();
	var time = {
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+'-'+(date.getMonth()+1),
		day:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
		minute:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+(date.getMinutes()>10?'0'+date.getMinutes():date.getMinutes())
	}

	var post = {
		name : this.name,
		title : this.title,
		time : time,
		post : this.post
	}

	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		};

		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			};

			collection.insert(post,{safe:true},function(err){
				mongodb.close();
				if (err) {
					return callback(err);
				};
				callback(null);
			});
		});
	});
}
Post.getAll = function(name,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		};

		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			};

			var query = {};

			if (name) {
				query.name = name;
			};

			collection.find(query).sort({
				time:-1
			}).toArray(function(err,docs){
				mongodb.close();
				if (err) {
					return callback(err);
				};
				docs.forEach(function(doc){
					doc.post = markdown.toHTML(doc.post);
				});
				callback(null,docs);
			});
		});
	});
}
Post.getOne = function(name,day,title,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		};

		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			};

			collection.findOne({
				'name':name,
				'title':title,
				'time.day':day
			},function(err,doc){
				mongodb.close();

				if (err) {
					return callback(err);
				};

				doc.post = markdown.toHTML(doc.post);
				callback(null,doc);
			});
		});
	});
}
Post.edit = function(name,title,day,callback){
	mongodb.open(function(err,db){
		if (err) {
			return callback(err);
		};

		db.collection('posts',function(err,collection){
			if (err) {
				mongodb.close();
				return callback(err);
			};

			collection.findOne({
				'title':title,
				'time.day':day,
				'name':name
			},function(err,doc){
				mongodb.close();
				if (err) {
					return callback(err);
				};

				callback(null,doc);
			});

		});
	});
}