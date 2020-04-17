# Chatserver

This is a simple web-based chatserver

It's running on Node.js and uses Socket.io and Express.

### Setup:

* Install Node.js and npm. (npm usually comes with Node)
* Clone this repository
* Go to the directory of the repository and run `npm install`. This installs Socket.io, Express and Nodemon (a devoloping tool for restarting scripts - not needed for production)
* The main file is scripts/server.js. Run it with either `node scripts/server.js` or `nodemon scripts/server.js` to use nodemon.

### Disclaimer
All messages are loaded into RAM. This project is meant to be used in a small scale.

I am not a designer, so I based the design on Whatsapp web.
