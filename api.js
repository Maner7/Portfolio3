var express     = require('express');
var os          = require('os');
var fs          = require('fs');
var request     = require('request');
var bodyParser  = require('body-parser');
var mysql       = require('mysql');

var api = function() {
    var self = this;

    //Set up server IP address and portnumber.   
    self.setupVariables = function() {
        self.ipaddress = '127.0.0.1';
        self.port      = 8045;
        self.dir       =  __dirname;
    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating server ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };
        self.posts  = { };

        //Default endpoint.
        self.routes['/'] = function (req, res) {
            res.sendFile(self.dir + '/HTMLPage1.html');
        };
        
        //GET
        self.routes['/health'] = self.healthStatus;                      //Check server health
        self.routes['/users/id/:id'] = self.getUserById;                 //users
        self.routes['/search/:group/:exp'] = self.search;                //direct search
        self.routes['/answers/id/:id'] = self.getAnswersById;            //answers
        self.routes['/kommentarer/id/:id'] = self.getKommentarerById;    //kommentarer
        self.routes['/questions/id/:id'] = self.getQuestionsById;        //questions        
    };
    
     //Initialize the server and create the routes and register the handlers.
  
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.use(express.static(__dirname));
        //Add handlers for the application.
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }

        for (var p in self.posts) {
            self.app.post(p, self.posts[p]);
        }

        self.app.use(self.invalidPage);
    };

    
     // Initializes the application.
    
    self.initialize = function() {
     //Setup required variables (ip, port, terminators etc.)
        self.setupVariables();
        self.setupTerminationHandlers();
     // Create the express server and routes.
        self.initializeServer();
    };

    
     //Start the server
    
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

    //----------------------------------------------------------------------------------------------

    //Check server health.
    self.healthStatus = function(req, res){
        res.writeHead(200);
        res.end("Server is alive and well");
    };

    //Search all
    self.search = function(req, res){
        var group = req.params.group;
        var q = req.params.exp;

        if (!(group === 'answers' || group === 'users' || group === 'kommentarer' || group === 'questions')) res.end('Missing Parameter');

        var initquery = 'SELECT * FROM ' + group + ' WHERE 1=1 LIMIT 1';

        self.makeQuery(initquery, function (rows) {
            var query = 'SELECT DISTINCT * FROM ' + group + ' WHERE ';
            var regexp = ' REGEXP \'' + q + '\' OR ';
            var item = rows[0];
            for(var key in item){
                query+=(key + regexp)
            }
            query+='1=2';
            self.makeQuery(query, function (rows2) {   
                res.end(JSON.stringify(rows2, null, 3))
            });
        });
    }

    //Get users
    self.getUserById = function (req, res) {
        var id = req.params.id;
        var regex = req.query.regex;
        console.log(regex);
        var query = 'SELECT DISTINCT * FROM users WHERE userid = ' + id;

        self.makeQuery(query, function (rows) {
            res.end(JSON.stringify(rows, null, 3))
        });
    }

    //Get answers
    self.getAnswersById = function (req, res) {
        var id = req.params.id;
        var query = 'SELECT DISTINCT * FROM answers WHERE id = ' + id;

        self.makeQuery(query, function (rows) {
            res.end(JSON.stringify(rows, null, 3))
        });
    }

    //Get kommentarer
    self.getKommentarerById = function (req, res) {
        var id = req.params.id;
        var query = 'SELECT DISTINCT * FROM kommentarer WHERE commentid = ' + id;

        self.makeQuery(query, function (rows) {
            res.end(JSON.stringify(rows, null, 3))
        });
    }

    //Get questions
    self.getQuestionsById = function (req, res) {
        var id = req.params.id;
        var query = 'SELECT DISTINCT * FROM questions WHERE id = ' + id;

        self.makeQuery(query, function (rows) {
            res.end(JSON.stringify(rows, null, 3))
        });
    }

    self.makeQuery = function (query, callback) {
        var connection = mysql.createConnection({
            host: 'wt-220.ruc.dk',
            user: 'andjens',
            password: 'EfO5aVOS',
            database: 'andjens'
        });

        connection.connect(function (err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
        });

        connection.query(query, function (err, rows, fields) {

            if (err) {
                throw err;
            }
            connection.end()
            callback(rows);
        })
    }

    //----------------------------------------------------------------------------------------------

    self.invalidPage = function(req, res, next){
        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
            res.end('404 Invalid Endpoint');
            return;
        }

        // respond with json
        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    }
}

var node = new api();
node.initialize();
node.start();