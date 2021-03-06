var url = require('url');
var express = require('express'); // takes care of http
var _ = require('underscore');
var app = express();
var connection = require('./database');
// var multiparty = require('multiparty');
var bodyParser = require('body-parser');

var authRouter = require('./lib/routers/auth');
var adminRouter = require('./lib/routers/admin');
var blogRouter = require('./lib/routers/blog');

var session = require('cookie-session');
var fs = require('fs');
var methodOverride = require('method-override')
app.locals.moment = require('moment');
// var authenticationPassport = require('./lib/authentication');


// use jade, similar to haml but compiled with javascript ;)
app.set('view engine', 'jade');

// =================
// = sessions shit =
// =================

app.use(session({
  secret: '',
  resave: false,
  saveUninitialized: true
}));

// body parse my params into json
app.use( bodyParser.urlencoded({ extended: false}) );
// app.use(methodOverride('_method'))


app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// check for sesssion if go to place where need session
app.all('/admin/*', function(req, res, next){
  if(!req.session.admin && (req.url != '/admin/login')){
    res.redirect('/admin/login');
  } else {
    next();
  }
})

// ==================
// = use my routers =
// ==================

// authentication
app.use(authRouter);
// admin pages
app.use(adminRouter);
// blogs in admin
app.use(blogRouter);

// homepage
app.get('/', function(request, response, next){
  // interally writehead, write, end.. express has wrapped it up for us
  //response.status(200).send("</h1>Welcome to DorothyJanes site.</h1><br/> It is currently under construction. Please come back soon.");

  var query = "select * from blogs where published_at is not null order by published_at"

  connection.query(query, {}, function(err, results){
    if(err){
      return response.status(500).send("SQL filter gone wrong", err); // 500 is internal server error
    }

    response.render('index', {
      title: 'dorothy jane wingrove',
      theme: 'style-one',
      links: {
        linkedin: "https://uk.linkedin.com/in/dorothy-wingrove-98171259",
        github: "https://github.com/notthepoint",
        twitter: "https://twitter.com/notthepoint",
        instagram: "http://instagram.com/dottiejane/",
        codepen: "http://codepen.io/dorothy/",
      },
      blogs: results
    });
  });
});

// app.get('/feed', function(request, response, next){
//   response.render('feed', {
//     twitter_id: ''
//   });
// });

// static folder directory (telling the browser where to look)
app.use(express.static('assets'));

// * is any url... in order so this must happen last, above routes are fine
app.get('*', function(request, response, next){
  response.status(404).send("NOT FOUND!!!!!!!!!!!");
})

// <3 <3 <3 <3
// <3  GO!! <3
// <3 <3 <3 <3

connection.getConnection(function(error){
  // if(error){ throw error; }
  var port = process.env.PORT || 8080; // carefull this will work on 0 !!!!
  app.listen(port);
});

