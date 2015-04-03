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

ResponseRoutes['InsecureConnectionErr'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type === 'InsecureConnection')
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['NotValidatedErr'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type === 'NotValidated')
    {
        Res.status(404).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['UsersPost'] = function(SendEmail) {
    return(function(Req, Res, Next) {
        GetRoutingVars(Req, Res, Next, function(RoutingVars) {
            if(SendEmail)
            {
                SendEmail(RoutingVars['User'], null, function(Err) {
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

ResponseRoutes['UsersPostErr'] = function(Err, Req, Res, Next) {
    if(Err.Type && (Err.Type==='StoreConstraint' || Err.Type==='NoInsertion'))
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['UserPatch'] = function(SendEmail) {
    return(function(Req, Res, Next) {
        GetRoutingVars(Req, Res, Next, function(RoutingVars) {
            if(SendEmail)
            {
                SendEmail(RoutingVars['User'], RoutingVars['Update'], function(Err) {
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

ResponseRoutes['UserPatchErr'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==='NoUpdate')
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['UserDelete'] = function(Req, Res, Next) {
    GetRoutingVars(Req, Res, Next, function(RoutingVars) {
        Res.status(204).end();
    });
}

ResponseRoutes['UserDeleteErr'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==='NoDelete')
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['UserGet'] = function(GetSerializer) {
    return(function(Req, Res, Next) {
        GetSerializer(Req, Res, Next);
    });
}

ResponseRoutes['UserGetErr'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoUser")
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['UsersCountGet'] = function(CountSerializer) {
    return(function(Req, Res, Next) {
        CountSerializer(Req, Res, Next);
    });
}

ResponseRoutes['UserMembershipsPut'] = function(Req, Res, Next) {
    Res.status(204).end();
}

ResponseRoutes['UserMembershipsPutErr'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoInsertion")
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['UserMembershipsDelete'] = function(Req, Res, Next) {
    Res.status(204).end();
}

ResponseRoutes['UserMembershipsDeleteErr'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoDeletion")
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['SessionUserPut'] = function(Req, Res, Next) {
    Res.status(204).end();
}

ResponseRoutes['SessionUserPutErr'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoUser")
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['SessionUserDelete'] = function(Req, Res, Next) {
    Res.status(204).end();
}

ResponseRoutes['SessionUserDeleteErr'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoSessionUser")
    {
        Res.status(410).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['NoSessionUser'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoSessionUser")
    {
        Res.status(401).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['NoAuth'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoAuth")
    {
        Res.status(401).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['BadField'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="BadField")
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['NoID'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoID")
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['NoField'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoField")
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['PrivateField'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="PrivateField")
    {
        Res.status(401).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['InvalidAuth'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="InvalidAuth")
    {
        Res.status(401).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['BadBody'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="BadBody")
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['NoAuto'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoAuto")
    {
        Res.status(400).end();
    }
    else
    {
        Next(Err);
    }
}

ResponseRoutes['NoAccess'] = function(Err, Req, Res, Next) {
    if(Err.Type && Err.Type==="NoAccess")
    {
        Res.status(401).end();
    }
    else
    {
        Next(Err);
    }
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
        Router.use('/Users', ResponseRoutes['UsersPostErr']);
        
        if(Roles&&Roles.Edit)
        {
            Router.patch('/User/:Field/:ID', ResponseRoutes.UserPatch());
            Router.use('/User/:Field/:ID', ResponseRoutes['UserPatchErr']);
            Router.put('/User/:Field/:ID/Memberships/:Membership', ResponseRoutes.UserMembershipsPut);
            Router.use('/User/:Field/:ID/Memberships/:Membership', ResponseRoutes.UserMembershipsPutErr);
        }
        Router.patch('/User/Self', ResponseRoutes.UserPatch());
        Router.use('/User/Self', ResponseRoutes['UserPatchErr']);
        Router.post('/User/:Field/:ID/Recovery/:SetField', ResponseRoutes.UserPatch(SendEmail));
        Router.use('/User/:Field/:ID/Recovery/:SetField', ResponseRoutes['UserPatchErr']);
        Router.use('/User/:Field/:ID/Recovery/:SetField', ResponseRoutes['NoAuto']);
        Router.put('/User/Self/Memberships/:Membership', ResponseRoutes.UserMembershipsPut);
        Router.use('/User/Self/Memberships/:Membership', ResponseRoutes.UserMembershipsPutErr);
        
        if(Roles&&Roles.Delete)
        {
            Router.delete('/User/:Field/:ID', ResponseRoutes.UserDelete);
            Router.use('/User/:Field/:ID', ResponseRoutes.UserDeleteErr);
            Router.delete('/User/:Field/:ID/Memberships/:Membership', ResponseRoutes.UserMembershipsDelete);
            Router.use('/User/:Field/:ID/Memberships/:Membership', ResponseRoutes.UserMembershipsDeleteErr);
        }
        Router.delete('/User/Self', ResponseRoutes.UserDelete);
        Router.use('/User/Self', ResponseRoutes.UserDeleteErr);
        Router.delete('/User/Self/Memberships/:Membership', ResponseRoutes.UserMembershipsDelete);
        Router.use('/User/Self/Memberships/:Membership', ResponseRoutes.UserMembershipsDeleteErr);
        
        if(Roles&&Roles.Get)
        {
            Router.get('/User/:Field/:ID', ResponseRoutes.UserGet(GetSerializer));
            Router.use('/User/:Field/:ID', ResponseRoutes['UserGetErr']);
        }
        Router.get('/User/Self', ResponseRoutes.UserGet(GetSerializer));
        Router.use('/User/Self', ResponseRoutes['UserGetErr']);
        
        Router.get('/Users/:Field/:ID/Count', ResponseRoutes.UsersCountGet(CountSerializer));
        
        Router.put('/Session/Self/User', ResponseRoutes.SessionUserPut);
        Router.use('/Session/Self/User', ResponseRoutes.SessionUserPutErr);
        
        Router.delete('/Session/Self/User', ResponseRoutes.SessionUserDelete);
        Router.use('/Session/Self/User', ResponseRoutes.SessionUserDeleteErr);
        
        Router.use('/', ResponseRoutes['InsecureConnectionErr']);
        Router.use('/', ResponseRoutes['NoAccess']);
        Router.use('/', ResponseRoutes['NotValidatedErr']);
        Router.use('/', ResponseRoutes['NoSessionUser']);
        Router.use('/', ResponseRoutes['NoAuth']);
        Router.use('/', ResponseRoutes['BadField']);
        Router.use('/', ResponseRoutes['NoID']);
        Router.use('/', ResponseRoutes['NoField']);
        Router.use('/', ResponseRoutes['PrivateField']);
        Router.use('/', ResponseRoutes['InvalidAuth']);
        Router.use('/', ResponseRoutes['BadBody']);
    };
};


