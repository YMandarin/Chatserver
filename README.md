# Chatserver

This is a simple web-based chatserver

It's running on Node.js and uses Socket.io and Express.


### Setup:

* you need Node.js installed
* clone this repository
* go to the directory of the repository and run `npm install`. This installs Socket.io, Express and Nodemon (a devoloping tool for starting files - not needed for production)
* the main file is scripts/server.js. Run it with either `node scripts/server.js` or `nodemon scripts/server.js` to use nodemon.


### Disclaimer
All messages are loaded into RAM. This project is meant to be used in a small scale.
I am not a designer, so I based the design on Whatsapp web.
