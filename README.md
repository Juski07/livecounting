# Live counting

This project is a web interface made in the context of a master thesis on the crowd counting and developed by Louis Robins & Henri Collin.

The online interface is the following [livecounting](https://juski07.github.io/livecounting/) and it proposes :
* Upload or take a live picture in order to know how many people are on it.
* Choose between three differents models depending on the context.

## Run the application : client-only approach

To run the application locally, you have to run `npm install` to install all packages and `npm start` to start the application. Both commands should be executed in the root folder.

With this method, you will not have a backend server performing the computations.

## Run the application : client-server approach

It is also possible to run the application with a backend server by executing `npm install` and `npm start` in the backend folder.

Please note that some modifications are needed to use this method. Indeed, you have to modify the functions called in the frontend so that it will make the link with the backend.

## Create your own HTTP-server

The only-client approach use an HTTP-server to load the models. If you want to launch your interface, you can create your own server on [000webhost](https://www.000webhost.com/). However, if you want to launch your application locally, an easier way is to use the npm package [http-server](https://www.npmjs.com/package/http-server).

