//Copyright (c) 2015 Eric Vallee <eric_vallee2003@yahoo.ca>
//MIT License: https://raw.githubusercontent.com/Magnitus-/ExpressUserLocalBasic/master/License.txt

function GetRoutingVars(Req, Res, Next, Callback)
{
    var RoutingVars = Res.locals.ExpressUser ? Res.locals.ExpressUser : null;
    if(RoutingVars)
    {
        Callback(RoutingVars)
    }
    else
    {
        var Error = new Error();
        Error.Type = "NotValidated";
        Next(Err);
    }
}

var ResponseRoutes = {};

ResponseRoutes['UsersPost'] = function(SendEmail) {
    return(function(Req, Res, Next) {
        GetRoutingVars(Req, Res, Next, function(RoutingVars) {
            if(SendEmail)
            {
                var GeneratedVars = RoutingVars['Generated'] ? RoutingVars['Generated'] : null;
                SendEmail(RoutingVars['User'], null, GeneratedVars, function(Err) {
                    Res.status(201).end();
                });
            }
            else
            {
                Res.status(201).end();
            }
        });
    });
}

ResponseRoutes['UserPatch'] = function(SendEmail) {
    return(function(Req, Res, Next) {
        GetRoutingVars(Req, Res, Next, function(RoutingVars) {
            if(SendEmail)
            {
                var GeneratedVars = RoutingVars['Generated'] ? RoutingVars['Generated'] : null;
                SendEmail(RoutingVars['User'], RoutingVars['Update'], GeneratedVars, function(Err) {
                    Res.status(204).end();
                });
            }
            else
            {
                Res.status(204).end();
            }
        });
    });
}

ResponseRoutes['UserGet'] = function(GetSerializer) {
    return(function(Req, Res, Next) {
        GetSerializer(Req, Res, Next);
    });
}

ResponseRoutes['UsersCountGet'] = function(CountSerializer) {
    return(function(Req, Res, Next) {
        CountSerializer(Req, Res, Next);
    });
}

function ReturnStatus(Code)
{
    if(Code >= 400)
    {
        return(function(Err, Req, Res, Next) {Res.status(Code).end();});
    }
    else
    {
        return(function(Req, Res, Next) {Res.status(Code).end();});
    }
}

ResponseRoutes['MembershipInsertionErr'] = function(Err, Req, Res, Next) {
    var ReturnStatus404 = ReturnStatus(404);
    if(Err.Source && Err.Type && Err.Source === 'ExpressUser' && Err.Type === 'NoInsertion')
    {
        ReturnStatus404(Err, Req, Res, Next);
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['GlobalErr'] = function() {
    var Handler = {};
    Handler['ExpressAccessControl'] = ReturnStatus(401);
    Handler['ExpressUserLocal'] = {};
    Handler['ExpressUserLocal']['BadBody']  = ReturnStatus(400);
    Handler['ExpressUserLocal']['BadField']  = ReturnStatus(400);
    Handler['ExpressUserLocal']['NoAuth']  = ReturnStatus(400);
    Handler['ExpressUserLocal']['NoField']  = ReturnStatus(400);
    Handler['ExpressUserLocal']['NoID']  = ReturnStatus(400);
    Handler['ExpressUserLocal']['PrivateField']  = ReturnStatus(401);
    Handler['ExpressUserLocal']['NoAuto']  = ReturnStatus(400);
    Handler['ExpressUserLocal']['InsecureConnection']  = ReturnStatus(400);
    Handler['UserStore'] = ReturnStatus(409);
    Handler['ExpressUser'] = {};
    Handler['ExpressUser']['NotValidated'] = ReturnStatus(404);
    Handler['ExpressUser']['NoInsertion'] = ReturnStatus(400);
    Handler['ExpressUser']['NoUpdate'] = ReturnStatus(404);
    Handler['ExpressUser']['NoDelete'] = ReturnStatus(404);
    Handler['ExpressUser']['NoDeletion'] = ReturnStatus(404);
    Handler['ExpressUser']['NoUser'] = ReturnStatus(404);
    Handler['ExpressUser']['NoSessionUser'] = ReturnStatus(404);
    
    return(function(Err, Req, Res, Next) {
        if(Err.Type && Err.Source && Handler[Err.Source] !== undefined)
        {
            if(typeof(Handler[Err.Source]) === 'function')
            {
                Handler[Err.Source](Err, Req, Res, Next);
            }
            else if(Handler[Err.Source][Err.Type] !== undefined)
            {
                Handler[Err.Source][Err.Type](Err, Req, Res, Next);
            }
            else
            {
                Next(Err);
            }
        }
        else
        {
            Next(Err);
        }
    });
}

module.exports = function(Options) {
    var Roles = Options && Options.Roles ? Options.Roles : {'Edit': ['Admin'], 'Delete': ['Admin'], 'Get': ['Admin']};
    var SendEmail = Options && Options.SendEmail ? Options.SendEmail : null;
    var GetSerializer = Options && Options.GetSerializer ? Options.GetSerializer : function(Req, Res, Next) {
        GetRoutingVars(Req, Res, Next, function(RoutingVars) {
            var User = RoutingVars.Result;
            if(RoutingVars.Hide)
            {
                RoutingVars.Hide.forEach(function(Field, Index, List) {
                    delete User[Field];
                });
            }
            Res.status(200).json(User);
        });
    };
    var CountSerializer = Options && Options.CountSerializer ? Options.CountSerializer : function(Req, Res, Next) {
        GetRoutingVars(Req, Res, Next, function(RoutingVars) {
            var Count = RoutingVars.Result;
            Res.status(200).json({'Count': Count});
        });
    };
    
    return function(Router) {
        Router.post('/Users', ResponseRoutes.UsersPost(SendEmail));
        
        if(Roles&&Roles.Get)
        {
            Router.get('/User/:Field/:ID', ResponseRoutes.UserGet(GetSerializer));
        }
        Router.get('/User/Self', ResponseRoutes.UserGet(GetSerializer));
        Router.get('/Users/:Field/:ID/Count', ResponseRoutes.UsersCountGet(CountSerializer));
        
        if(Roles&&Roles.Delete)
        {
            Router.delete('/User/:Field/:ID', ReturnStatus(204));
            Router.delete('/User/:Field/:ID/Memberships/:Membership', ReturnStatus(204));
        }
        Router.delete('/User/Self', ReturnStatus(204));
        Router.delete('/User/Self/Memberships/:Membership', ReturnStatus(204));
        
        Router.put('/Session/Self/User', ReturnStatus(204));
        Router.delete('/Session/Self/User', ReturnStatus(204));
        
        if(Roles&&Roles.Edit)
        {
            Router.patch('/User/:Field/:ID', ResponseRoutes.UserPatch(SendEmail));
            Router.put('/User/:Field/:ID/Memberships/:Membership', ReturnStatus(201));
        }
        Router.patch('/User/Self', ResponseRoutes.UserPatch());
        Router.post('/User/:Field/:ID/Recovery/:SetField', ResponseRoutes.UserPatch(SendEmail));
        Router.put('/User/Self/Memberships/:Membership', ReturnStatus(201));
        
        Router.use('/User/Self/Memberships/Validated', ResponseRoutes.MembershipInsertionErr);
        Router.use('/User/:Field/:ID/Memberships/:Membership', ResponseRoutes.MembershipInsertionErr);
        Router.use('/', ResponseRoutes.GlobalErr());
    };
};


