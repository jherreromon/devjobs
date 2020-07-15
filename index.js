//lo primero q debe de aparecer
const mongoose = require('mongoose');
require('./config/db');
const express = require('express');
const router = require('./routes');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

const path = require('path');
//permite trabajar con cookies, para dejar la sesion de la bbdd abierta
//cuando vayamos entre páginas
const cookieParser = require('cookie-parser');
const session = require('express-session');
//pasa session a la conexion de mongo
const MongoStore = require('connect-mongo')(session);
//para poder pasar los datos del body al servidor desde cliente
//es un objeto q viene con express
const bodyParser = require('body-parser');
//sirve para "sinitizar las entradas"+ un campo sea igual a otro....
const expressValidator = require('express-validator');
//alertas y flash messages
const flash = require('connect-flash');
//importamos el archivo de configuracion de passport
const passport = require('./config/passport');
//manejo de errores (x ejemplo, de conexion)
const createError = require('http-errors');

require('dotenv').config({ path: 'variables.env' });

const app = express();

//para poder leer los archivos que se suben
app.use(bodyParser.json());
//habilitar body-parser
app.use(bodyParser.urlencoded({ extended: true }));

//validación de campos(ojo!!! version antigua)
//app.use(expressValidator());

//habilitar handlebars como view
app.engine('handlebars',
    exphbs({
        defaultLayout: 'layout',
        //son script q se comunican 
        //con handlebars antes de su salida
        helpers: require('./helpers/handlebars'),
        //ojo!!! añadido x mi para usar req.user en exports.formEditarPerfil 
        handlebars: allowInsecurePrototypeAccess(Handlebars)

    })
);
app.set('view engine', 'handlebars');

//static files
app.use(express.static(path.join(__dirname, 'public')));

//necesario para firmar la session
// y estar logeado en la bbdd 
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })


}));

//inicializar passport
app.use(passport.initialize());
app.use(passport.session());


//Alertas y flash messages
app.use(flash());

//Crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

//raiz de toda la aplicacion
app.use('/', router());

//despues de los router(), pasamos a un middleware de errores
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
})

//*************AHORA SE EXPLICA, EL RETURN NEXT()!!!!!!
//Administracion de los errores:cuando hay un error en un middleware, es lo primero
//q se le pasa

app.use((error, req, res) => {
    //console.log(error.message);
    res.locals.mensaje = error.message;
    //si el error no esta capturado, q sea 500
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);

    //console.log(error.status);

    res.render('error');

})

//app.listen(5000);
//Dejar q heroku, asigne el puerto a nuestra aplicación
const host = '0.0.0.0';
//process.env.PORT-> heroku le llama así.
const port = process.env.PORT;

app.listen(host, port, () => {
    console.log('el servidor esta funcionando');
});