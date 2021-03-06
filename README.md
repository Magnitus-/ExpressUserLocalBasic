Express-User-Local-Basic
========================

Basic response handlers, built to be compatible with the express-user-local project.

It is the responder part of the validator/Store/Responder architecture (filled respectively by express-user-local, express-user and this project) which was designed to handle user management with Express.

Usage
=====

NOTE TO SELF: Make sure email is always included in User during session fetches.

Error Responses
===============

This library assumes that requests are made from a rich client which does a lot of error checking on the client-side (for field presence, correctness, etc) for non-malicious users.

As such, the error reporting are limited to status codes, the vast majority of which will be encountered only by users who bypass the client-side error verification.

While it cannot enforce security, I would personnality recommend doing as much supplemental error checking on the client-side as possible for the following reasons:

- It's more convenient for users to get their input errors reported without having to wait for a server request
- Given that the overwelming majority of input errors will come from non-malicious users, it lightens the load on the server if most of those errors are reported directly by the client without doing a server request
- By putting error checking on the client, you can more easily isolate malicious users as many types of errors become possible only by those who bypass error verification on the client

Error Codes
-----------

Here are the error codes for variety of errors:

- Source: ExpressAccessControl

Always return 401.

- Source: ExpressUserLocal

400: BadBody, BadField, NoAuth, NoField, NoID, NoAuto, InsecureConnection

401: PrivateField

- Source: ExpressUser

400: NoInsertion with POST /Users route, 

404: NotValidated, NoUpdate, NoDelete, NoDeletion, NoUser, NoSessionUser, NoInsertion with PUT /User/Self/Memberships/Validated and PUT /User/:Field/:ID/Memberships/:Membership route

- Source: UserStore

Always return 409.

Success Responses
=================

SendEmail
----------

SendEmail always gets called for both PATCH routes, the POST /User/:Field/:ID/Recovery/:SetField route and the POST /Users route.

Its first 3 arguments are the 'User', 'Update' and 'Generated' arguments. It is up to the SendMail call to determine whether to send an email based on their values, craft the content of that email and send it.

For the POST /Users route, 'User' contains all the fields of the newly created user and 'Update' is null.

For all other routes, User contains fields identifying and authentifying the user to operate on while Update contains the new value of fields to update.

Also, for all routes, Generated contains a list fields that were automatically generated for the user or null if no fields were automatically generated.

POST /Users
-----------

Calls SendEmail if it's defined. Returns 201.

PATCH /User/Self
----------------


DELETE /User/Self
-----------------



GET /User/Self
--------------

Defers handling to the GetSerializer option.

PUT /Session/Self/User
----------------------



DELETE /Session/Self/User
-------------------------


GET /Users/:Field/:ID/Count
---------------------------

Defers handling to the CountSerializer option.

PUT /User/Self/Memberships/Validated
------------------------------------


POST /User/:Field/:ID/Recovery/:SetField
----------------------------------------


PATCH /User/:Field/:ID
----------------------


DELETE /User/:Field/:ID
-----------------------


GET /User/:Field/:ID
--------------------

Defers handling to the GetSerializer option.

PUT /User/:Field/:ID/Memberships/:Membership
--------------------------------------------


DELETE /User/:Field/:ID/Memberships/:Membership
-----------------------------------------------


History
=======

1.0.0
-----

- Refactored code
- Changed status codes for some routes
- Changed expect email function format to receive the array of generated fields as its third argument
- Implemented tests
- Finished documentation

0.0.1-alpha.3
-------------

- Updated library to take account new error returned by the version 2.0.0 of express-access-control 
- Removed Roles argument from route handling closure as per changes to version 1.0.0 of express-user

0.0.1-alpha.2
-------------

- Updated library to be compatible with route change in the 0.0.1-alpha.15 version of express-user
- Updated library to handle response feedback from version 0.0.1-alpha.12 of express-user-local

0.0.1-alpha.1
-------------

Initial prototype
