var Nimble = require('nimble');
var Express = require('express');
var Http = require('http');
var ExpressUser = require('express-user');
var ExpressUserLocal = require('express-user-local');
var ExpressUserLocalRes = require('../lib/ExpressUserLocalBasic');
var UserProperties = require('user-properties');
var UserStore = require('user-store');
var MongoDB = require('mongodb');
var Session = require('express-session');
var SessionStore= require('express-session-mongodb');
var BodyParser = require('body-parser');
var Uid = require('uid-safe').sync;

var Context = {};

var RandomIdentifier = 'ExpressUserLocalResTests'+Math.random().toString(36).slice(-8);

var SessionStoreOptions = {'TimeToLive': 300, 'IndexSessionID': true, 'DeleteFlags': true};

var EmailRegex = require('regex-email');
var UsernameRegex = new RegExp("^[a-zA-Z][\\w\\+\\-\\.]{0,19}$");
var PasswordRegex = new RegExp("^.{8,20}$");
function EmailTokenValidation(Value)
{
    if(Value !== null && Value !== undefined && Value.length !== undefined)
    {
        return Value.length > 3;
    }
    else
    {
        return true;
    }
}

function SendEmail(RoutingVars, Email, Callback)
{
    var Source = null;
    Source = RoutingVars.Updated ? RoutingVars.Updated : RoutingVars.User;
    Context['EmailContent'] = {'Email': Email};
    if(Source['Password'])
    {
        Context['EmailContent']['PassWord'] = Source['Password'];
    }
    if(Source['EmailToken'])
    {
        Context['EmailContent']['EmailToken'] = Source['EmailToken'];
    }
}

function Setup(UserSchema, Callback)
{
    MongoDB.MongoClient.connect("mongodb://localhost:27017/"+RandomIdentifier, {native_parser:true}, function(Err, DB) {
        UserStore(DB, UserSchema, function(Err, UserStoreInst) {
            SessionStore(DB, function(Err, SessionStoreInst) {
                Context['DB'] = DB;
                Context['UserStore'] = UserStoreInst;
                var App = Context['App'] = Express();
                
                App.use(Session({
                    'secret': 'qwerty!',
                    'resave': true,
                    'saveUninitialized': true,
                    'store': SessionStoreInst
                }));
                
                App.put('/User/Self/Memberships/Admin', function(Req, Res, Next) {
                    if(Req.session.User)
                    {
                        UserStoreInst.AddMembership({'Email': Req.session.User.Email}, 'Admin', function(Err, Result) {
                            if(Err)
                            {
                                Next(Err);
                            }
                            else
                            {
                                if(Result>0)
                                {
                                    Res.status(200).end();
                                }
                                else
                                {
                                    Res.status(400).end();
                                }
                            }
                        });
                    }
                    else
                    {
                        Res.status(400).end();
                    }
                });
                
                App.use(BodyParser.json());
                App.use(ExpressUser.SessionRoute(UserStoreInst, '_id'));
                
                var ExpressUserLocalOptions = {'UserSchema': UserSchema};
                var ExpressUserLocalResOptions = {'SendEmail': SendEmail};
                var UserRouter = ExpressUser(UserStoreInst, {'Validator': ExpressUserLocal(ExpressUserLocalOptions), 'Responder': ExpressUserLocalRes(ExpressUserLocalResOptions)});
                App.use(UserRouter);
                Context['Server'] = Http.createServer(Context['App']);
                Context['Server'].listen(8080, function() {
                    Callback();
                });
            }, SessionStoreOptions);
        });
    });
}

var UserSchema = UserProperties({'Username': {
                  'Required': true,
                  'Unique': true,
                  'Mutable': false,
                  'Description': function(Value) {return UsernameRegex.test(Value)}
              },
              'Email': {
                  'Required': true,
                  'Unique': true,
                  'Privacy': UserProperties.Privacy.Private,
                  'Description': function(Value) {return EmailRegex.test(Value)}
              },
              'Password': {
                  'Required': true,
                  'Privacy': UserProperties.Privacy.Secret,
                  'Retrievable': false,
                  'Description': function(Value) {return PasswordRegex.test(Value)},
                  'Sources': ['User', 'Auto'],
                  'Generator': function(Callback) {Callback(null, Uid(15));}
              },
              'Gender': {
                  'Privacy': UserProperties.Privacy.Private,
                  'Mutable': false,
                  'Description': function(Value) {return Value=='M'||Value=='F'} //Reality is more complex, but for the sake of this example...
              },
              'Age': {
                  'Privacy': UserProperties.Privacy.Private,
                  'Description': function(Value) {return typeof(Value)==typeof(1) && Value > 0}
              },
              'Address': {
                  'Required': true,
                  'Privacy': UserProperties.Privacy.Private
              },
              'EmailToken': {
                  'Required': true,
                  'Privacy': UserProperties.Privacy.Secret,
                  'Access': 'Email',
                  'Sources': ['Auto'],
                  'Generator': function(Callback) {Callback(null, Uid(20));},
                  'Description': EmailTokenValidation
              },
              '_id': {
                  'Privacy': UserProperties.Privacy.Private,
                  'Access': 'System',
                  'Sources': ['MongoDB']
              }});
              
Setup(UserSchema, function() {
    console.log('Tests not yet implemented. Ran test server setup successfully. Will now exit...');
    Context.Server.close();
    Context.DB.close();
});