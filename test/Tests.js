//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/ExpressUserLocalBasic/master/License.txt


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
    Callback();
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

function RequestHandler()
{
    this.SessionID = null;
    if(!RequestHandler.prototype.SetSessionID)
    {
        RequestHandler.prototype.SetSessionID = function(Headers) {
            if(Headers["set-cookie"])
            {
                var SessionCookie = Headers["set-cookie"][0];
                SessionCookie = SessionCookie.slice(String("connect.sid=").length, SessionCookie.indexOf(';'));
                this.SessionID = SessionCookie;
            }
        };
        
        RequestHandler.prototype.Request = function(Method, Path, Callback, ReqBody, GetBody) {
            var Self = this;
            var RequestObject = {'hostname': 'localhost', 'port': 8080, 'method': Method, 'path': Path, 'headers': {'Accept': 'application/json'}};
            if(this.SessionID)
            {
                RequestObject['headers']['cookie'] = 'connect.sid='+this.SessionID;
            }
            if(ReqBody)
            {
                RequestObject.headers['Content-Type']='application/json';
                RequestObject.headers['Content-Length']=(JSON.stringify(ReqBody)).length;
            }
            var Req = Http.request(RequestObject, function(Res) {
                Res.setEncoding('utf8');
                var Body = "";
                if(!GetBody)
                {
                    Res.resume();
                }
                else
                {
                    Res.on('data', function (Chunk) {
                        Body+=Chunk;
                    });
                }
                Res.on('end', function() {
                    Self.SetSessionID(Res.headers);
                    Body = GetBody && Body ? JSON.parse(Body) : null;
                    Callback(Res.statusCode, Body);
                });
            });
            if(ReqBody)
            {
                Req.write(JSON.stringify(ReqBody), function() {
                    Req.end();
                });
            }
            else
            {
                Req.end();
            }
        };
    }
}

exports.Main = {
    'setUp': function(Callback) {
        var UserSchema = UserProperties(
            {'Username': {
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
            }}
        );
        Setup(UserSchema, Callback);
    },
    'tearDown': function(Callback) {
        Context.Server.close(function() {
            Context.DB.dropDatabase(function(Err, Result) {
                Context.DB.close();
                Callback();
            });
        });
    },
    'POST /Users': function(Test) {
        Test.expect(3);
        var Requester = new RequestHandler();
        Requester.Request('POST', '/Users', function(Status, Body) {
            Test.ok(Status === 400, "Confirming that requests with missing required parameters return 400.");
            Requester.Request('POST', '/Users', function(Status, Body) {
                Test.ok(Status === 400, "Confirming that requests with fields that do not pass validation return 400.");
                Requester.Request('POST', '/Users', function(Status, Body) {
                    Test.ok(Status === 201, "Confirming that valid creation returns 201.");
                    Test.done();
                }, {'User': {'Username': 'Magnitus', 'Email': 'ma@ma.ma', 'Password': 'hahahihihoho', 'Address': 'Vinvin du finfin'}}, true);
            }, {'User': {'Username': 'Magnitus', 'Email': '1', 'Password': 'hahahihihoho', 'Address': 'Vinvin du finfin'}}, true);
        }, {'User': {'Username': 'Magnitus', 'Email': 'ma@ma.ma', 'Password': 'hahahihihoho'}}, true);
    },
    'PATCH /User/Self': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'DELETE /User/Self ': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'GET /User/Self': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'PUT /Session/Self/User': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'DELETE /Session/Self/User': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'GET /Users/:Field/:ID/Count': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'PUT /User/Self/Memberships/:Membership': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'DELETE /User/Self/Memberships/:Membership': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'POST /User/Self/Recovery/:SetField': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'POST /User/:Field/:ID/Recovery/:SetField': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'PATCH /User/:Field/:ID': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'DELETE /User/:Field/:ID': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'GET /User/:Field/:ID': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'PUT /User/:Field/:ID/Memberships/:Membership': function(Test) {
        Test.expect(0);
        Test.done();
    },
    'DELETE /User/:Field/:ID/Memberships/:Membership': function(Test) {
        Test.expect(0);
        Test.done();
    }
}
