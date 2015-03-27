Express-User-Local-Basic
========================

Basic no-frills response handlers that mostly returns status code, built to be compatible with the express-user-local project.

It is the responder part of the validator/Store/Responder architecture (filled respectively by express-user-local, express-user and this project) I designed to handle user management with Express.

Status
======

Like its sibling projects, this library is in prototype stage at this point. It is untested (beyond basic manual tests) and I'll postpone the writing of automated tests until the API is relatively final.

In particular, only the response logic in express-user has been moved to this library so far. The same will have to be done for express-user-local.

More doc to come later. Feel free to look at the example in the express-user-local project for a complete implementation.

0.0.1-alpha.1
-------------

Initial prototype
