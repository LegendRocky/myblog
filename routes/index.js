var crypto = require('crypto'),
    fs = require('fs'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment.js'),
    path = require('path');
var multiparty = require('multiparty');
var util = require('util');

module.exports = function(app) {
  //在线用户计数
  app.get('/test', function (req, res){
    Post.getTen(null, 1, function (err, posts, total) {
      if (err) {
        posts = [];
      } 
      var data = JSON.stringify(posts);
      console.log(data);
      res.writeHead(200,{'content-type':'text/html','charset':'utf-8'})
      res.write(data);
      res.end();
    });
  });
  app.get('/', function (req, res) {
    console.log(1);
    //判断是否是第一页，并把请求的页数转换成 number 类型
    var page = req.query.p ? parseInt(req.query.p) : 1;
    //查询并返回第 page 页的 10 篇文章
    Post.getTen(null, page, function (err, posts, total) {
      if (err) {
        posts = [];
      } 
      console.log(posts);
      res.render('index', {
        title: '主页',
        posts: posts,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 10 + posts.length) == total,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('login', {
      title: '注册',
      loginOrReg:'reg',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'],
        nickname = req.body.nickname;
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!'); 
      return res.redirect('/reg');//返回主册页
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: req.body.name,
        password: password,
        email: req.body.email,
        nickname: req.body.nickname
    });
    //检查用户名是否已经存在 
    User.get(newUser.name, function (err, user) {
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/reg');//返回注册页
      }
      //如果不存在则新增用户
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');//注册失败返回主册页
        }
        console.log(user);
        req.session.user = user;//用户信息存入 session
        req.flash('success', '注册成功!');
        res.redirect('/');//注册成功后返回主页
      });
    });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登陆',
      loginOrReg:'login',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    console.log(123);
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    //console.log(req.body.name);
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!'); 
        return res.redirect('/login');//用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (user.password != password) {
        req.flash('error', '密码错误!'); 
        return res.redirect('/login');//密码错误则跳转到登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      req.flash('success', '登陆成功!');
      res.redirect('/');//登陆成功后跳转到主页
    });
  });

  app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
    console.log(req.session.user.nickname);
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.post, currentUser.nickname);
    post.save(function (err) {
      if (err) {
        console.log('error');
        req.flash('error', err); 
        return res.redirect('/');
      }
      res.redirect('/');//发表成功跳转到主页
    });
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');//登出成功后跳转到主页
  });

  app.get('/upload', checkLogin);
  app.get('/upload', function (req, res) {
    res.render('upload', {
      title: '文件上传',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/upload', checkLogin);
  app.post('/upload', function (req, res) {
    //console.log(req.body, req.files);
    // don't forget to delete all req.files when done
    //此处配置的下载目录应该是与app.js文件算起的目录路径
    var form = new multiparty.Form({uploadDir:'./public/images'});
    form.parse(req, function(err, fields, files) {
      //console.log(files.file1[0].path);
      if (err){
        //console.log('parse err: ' + err)
      } else {
        for(var i in files){
          if(files[i][0].originalFilename == ''){
            console.log('filename is:null');
          } else {
            console.log(files[i][0].originalFilename);
          }
        }
        //console.log('parse files: ' + files.file1[0].path);
        var inputFile = files.file1[0];
        //console.log(inputFile);
        var uploadedPath = inputFile.path;
        var dstPath = './public/images/' + inputFile.originalFilename;
        //console.log(uploadedPath+'\n'+dstPath);
        //重命名为真实文件名
        fs.rename(uploadedPath, dstPath, function(err) {
          if(err){
            console.log('rename error: ' + err);
          } else {
            console.log('rename ok');
          }
        });
      }
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
    });
    return;
  });

  app.get('/archive', function (req, res) {
    Post.getArchive(function (err, posts) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      res.render('archive', {
        title: '存档',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/tags', function (req, res) {
    Post.getTags(function (err, posts) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      res.render('tags', {
        title: '标签',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/tags/:tag', function (req, res) {
    Post.getTag(req.params.tag, function (err, posts) {
      if (err) {
        req.flash('error',err); 
        return res.redirect('/');
      }
      res.render('tag', {
        title: 'TAG:' + req.params.tag,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/links', function (req, res) {
    res.render('links', {
      title: '友情链接',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.get('/search', function (req, res) {
    Post.search(req.query.keyword, function (err, posts) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      res.render('search', {
        title: "SEARCH:" + req.query.keyword,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/u/:name', function (req, res) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    //检查用户是否存在
    User.get(req.params.name, function (err, user) {
      console.log(user);
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      if (!user) {
        req.flash('error', '用户不存在!'); 
        return res.redirect('/');
      }
      //查询并返回该用户第 page 页的 10 篇文章
      Post.getTen(user.name, page, function (err, posts, total) {
        if (err) {
          req.flash('error', err); 
          return res.redirect('/');
        }
        res.render('index', {
          title: user.name,
          posts: posts,
          page: page,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 10 + posts.length) == total,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });
    }); 
  });

  app.get('/u/:name/:day/:title', function (req, res) {
    Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      post.post.replace(/&lt;/,'<');
      post.post.replace(/&gt;/,'>');
      console.log(post.post);
      res.render('article', {
        title: req.params.title,
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/u/:name/:day/:title', function (req, res) {
    var date = new Date(),
        time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
               date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48"; 
    var comment = {
        name: req.body.name,
        head: head,
        email: req.body.email,
        website: req.body.website,
        time: time,
        content: req.body.content
    };
    var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
    newComment.save(function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      req.flash('success', '留言成功!');
      res.redirect('back');
    });
  });

  app.get('/edit/:name/:day/:title', checkLogin);
  app.get('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      res.render('edit', {
        title: '编辑',
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/edit/:name/:day/:title', checkLogin);
  app.post('/edit/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
      var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
      if (err) {
        req.flash('error', err); 
        return res.redirect(url);//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect(url);//成功！返回文章页
    });
  });

  app.get('/remove/:name/:day/:title', checkLogin);
  app.get('/remove/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      req.flash('success', '删除成功!');
      res.redirect('/');
    });
  });

  app.get('/reprint/:name/:day/:title', checkLogin);
  app.get('/reprint/:name/:day/:title', function (req, res) {
    Post.edit(req.params.name, req.params.day, req.params.title, function (err, post) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('back');
      }
      var currentUser = req.session.user,
          reprint_from = {name: post.name, day: post.time.day, title: post.title},
          reprint_to = {name: currentUser.name, head: currentUser.head};
      Post.reprint(reprint_from, reprint_to, function (err, post) {
        if (err) {
          req.flash('error', err); 
          return res.redirect('back');
        }
        req.flash('success', '转载成功!');
        var url = encodeURI('/u/' + post.name + '/' + post.time.day + '/' + post.title);
        res.redirect(url);
      });
    });
  });

  app.use(function (req, res) {
    res.render("404");
  });

  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!'); 
      res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!'); 
      res.redirect('back');//返回之前的页面
    }
    next();
  }
};
