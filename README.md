Express-User-Local-Basic
========================

Basic no-frills response handlers that mostly returns status code, built to be compatible with the express-user-local project.

It is the responder part of the validator/Store/Responder architecture (filled respectively by express-user-local, express-user and this project) I designed to handle user management with Express.

Status
======

At this point, the structure is stable.

However, I will still label this library as alpha until a good refactoring pass has been done to eliminate redundant code as well as unit tests and more extensive documentation.

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
