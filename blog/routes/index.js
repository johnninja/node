var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');

/* GET home page. */
router.get('/', function(req, res) {
	Post.getAll(null,function(err,posts){
		if (err) {
			posts = [];
		};
		res.render('index', { 
		  	title: '主页',
		  	user:req.session.user,
		  	posts:posts,
		  	success:req.flash('success').toString(),
		  	error:req.flash('error').toString()
		});
	});
});

/* GET login page */
router.get('/login',checkNotLogin);
router.get('/login', function (req, res) {
    res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()})
});
router.post('/login',checkNotLogin);
router.post('/login', function(req, res) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('hex');

	User.get(req.body.name,function(err,user){
		if (!user) {
			req.flash('error','用户不存在！');
			return res.redirect('/login');
		};
		if (user.password!=password) {
			req.flash('error','密码错误！');
			return res.redirect('/login');
		};

		req.session.user = user;
		req.flash('success','登陆成功');
		res.redirect('/');
	});
});

router.get('/reg',checkNotLogin);
router.get('/reg', function(req, res) {
  res.render('reg', { 
  	title: '主页',
  	user:req.session.user,
  	success:req.flash('success').toString(),
  	error:req.flash('error').toString()
  });
});
router.post('/reg',checkNotLogin);
router.post('/reg', function(req, res) {

 	var name = req.body.name;
 	var password = req.body.password;
 	var password_re = req.body['password-repeat'];

 	if (password_re!=password) {
 		req.flash('error','两次输入的密码不一致!');
 		return res.redirect('/reg');
 	};

 	var md5 = crypto.createHash('md5');
 	var password = md5.update(req.body.password).digest('hex');
 	var newUser = new User({
 		name:name,
 		password : password,
 		email : req.body.email
 	});

 	User.get(newUser.name,function(err,user){
 		if (err) {
 			req.flash('error',err);
 			return res.redirect('/');
 		};

 		if (user) {
 			req.flash('error','用户已存在！');
 			return res.redirect('/reg');
 		};

 		newUser.save(function(err,user){
 			if (err) {
 				req.flash('error',err);
 				return res.redirect('/reg');
 			};

 			req.session.user = user;
 			req.flash('success','注册成功！');
 			res.redirect('/');
 		});
 	});
});

router.get('/post',checkLogin);
router.get('/post', function(req, res) {
  res.render('post', {
  	title: '发表',
  	user:req.session.user,
  	success:req.flash('success').toString(),
  	error:req.flash('error').toString()
  });
});

router.post('/post',checkLogin);
router.post('/post',function(req,res){
	var currentUser = req.session.user;
	var post = new Post(currentUser.name,req.body.title,req.body.post);

	post.save(function(err){
		if (err) {
			req.flash('error',err);
			return res.redirect('/');
		};
		req.flash('success','发表成功！');
		res.redirect('/');
	})
});

//upload file
router.get('/upload',checkLogin); 
router.get('/upload',function(req,res){
	res.render('upload',{
		title:'上传图片',
		user:req.session.user,
		success:req.flash('success').toString(),
		error:req.flash('error').toString()
	});
});

router.post('/upload',checkLogin);
router.post('/upload',function(req,res){
	req.flash('success','上传成功！');
	res.redirect('/upload');
});
//logout
router.get('/logout', function(req, res) {
	req.session.user = null;
	req.flash('success','登出成功！');
	res.redirect('/');
});

router.get('/u/:name',function(req,res){
	User.get(req.params.name,function(err,user){
		if (!user) {
			req.flash('error',err);
			return res.redirect('/');
		};

		Post.getAll(user.name,function(err,posts){
			if (err) {
				req.flash('error',err);
				return res.redirect('/');
			};

			res.render('user',{
				title:user.name,
				posts:posts,
				user:req.session.user,
				success:req.flash('success').toString(),
				error:req.flash('error').toString()
			});
		});
	});
});
router.get('/u/:name/:day/:title',function(req,res){
	Post.getOne(req.params.name,req.params.day,req.params.title,function(err,post){
		if (err) {
			req.flash('error',err);
			return res.redirect('/');
		};

		res.render('article',{
			title:req.params.title,
			post:post,
			user:req.session.name,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
});
router.get('edit/:name/:day/;title',function(req,res){
	Post.edit(req.params.name,req.params.title,req.params.day,function(err,post){
		if (err) {
			req.flash('error',err);
			res.redirect('back');
		};
		res.render('edit',{
			title:'编辑',
			post:post,
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	})
});




module.exports = router;

function checkLogin(req,res,next){
	if (!req.session.user) {
		req.flash('error','未登录!');
		res.redirect('/login');
	};
	next();
}
function checkNotLogin(req,res,next){
	if (req.session.user) {
		req.flash('success','已登录');
		res.redirect('back');
	};
	next();
}