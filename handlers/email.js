const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
//util es necesario lo q viene siendo el callback cuando
//se envía el correo
const util = require('util');

//la configuración nodemailer debe ser así por definición
let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: false,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

// Utilizar Templates de Handlebars (usa la libreria nodemailer-express-handlebars)
transport.use(
    'compile',
    hbs({
        viewEngine: {
            //se pone el mismo nombre q tenga en el index.js
            extName: 'handlebars',
            partialsDir: __dirname + '/../views/emails',
            layoutsDir: __dirname + '/../views/emails',
            defaultLayout: 'reset.handlebars'
        },
        viewPath: __dirname + '/../views/emails',
        extName: '.handlebars'
    })
);

exports.enviar = async(opciones) => {
    const opcionesEmail = {
            from: 'devJobs <no-reply@devjobs.com>',
            to: opciones.usuario.email,
            subject: opciones.subject,
            template: opciones.archivo,
            //todo lo q sepone dentro de context, se puede utilizar en el template
            context: {
                resetUrl: opciones.resetUrl
            }
        }
        //enviar el correo a mailtrap
    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
}