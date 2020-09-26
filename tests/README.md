# Running tests

Tests depend on the [Jasmine](http://jasmine.github.io/) testing framework,
currently using v. 2.3.4, and are run in the browser. The Jasmine files are loaded on the fly from the CloudFlare CDN. 

[Express](https://expressjs.com/) is needed for running a basic local server. Run ```npm install express``` to install it. Then run ```node server.js``` in the tests folder to start the server. Finally, navigate to http://localhost:8000 in your browser to run the tests.npm 

To debug the effects audibly, please see [Tuna test](https://github.com/Theodeus/tunatest) - simple GUI to debug and preview the Tuna effects.