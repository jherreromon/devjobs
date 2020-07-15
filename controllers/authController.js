const passport = require('passport');
const mongoose = require('mongoose');
const Vacante = require('../models/Vacantes');
const Usuario = require('../models/Usuarios');
//ya viene con node/express
const crypto = require('crypto');
//Para poder usar el correo de "mailtrap"-> await enviarEmail.enviar(
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son Obligatorios'
});
// Revisar sí el usuario esta Autenticado
exports.verificarUsuario = (req, res, next) => {
    // Revisar el Usuario->metodo de PASSPORT
    if (req.isAuthenticated()) {
        return next(); // Esta Autenticado
    }
    //Redireccionar
    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async(req, res) => {
    // Consultar el Usuario Autenticado
    const vacantes = await Vacante.find({ autor: req.user._id }).lean();
    // console.log(vacantes);


    res.render('administracion', {
        nombrePagina: 'Panel de Administracion',
        tagline: 'Crea y Administra tus Vacantes desde aqui',
        cerrarSesion: true,
        //req.user, viene d passport y tiene tb la info de la imagen
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion = (req, res) => {
    req.logout();
    req.flash('correcto', 'Cerraste Sesión Correctamente');
    return res.redirect('/iniciar-sesion');
}

// Formulario para Reiniciar el Password
exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablece tu Password',
        tagline: 'Sí ya tienes cuenta y se te olvido tu Password coloca tu email'
    })
}

//busca correo de usuario y si existe genera token y expiración en la tabla 
//del usuario

exports.enviarToken = async(req, res, next) => {
    const usuario = await Usuario.findOne({ email: req.body.email });

    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }
    // El Usuario Existe , generar Token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el Usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;
    // console.log(resetUrl);

    // Enviar Notificacion por eMail->pasamos parámetros a la función
    //enviar que hemos generado en la carpeta handlers
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });
    // Todo correcto

    req.flash('correcto', 'Revisa tu eMail para resetear tu password');
    res.redirect('/iniciar-sesion');
}

// Valida sí el token es valido y el usuario existe, muestra la vista
exports.reestablecerPassword = async(req, res) => {
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            //$gt->mayor que...
            $gt: Date.now()
        }
    });
    if (!usuario) {
        req.flash('error', 'Tiempo agotado , vuelve a pedir contraseña');
        return res.redirect('/reestablecer-password');
    }
    // TOdo bien mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'

    });

}

// Almacena el nuevo password en la DB
exports.guardarPassword = async(req, res) => {
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });
    // No existe el Usuario o el Token ya no es valido
    if (!usuario) {
        req.flash('error', 'Tiempo agotado , vuelve a pedir contraseña');
        return res.redirect('/reestablecer-password');
    }

    // Asignar nuevo Password, limpiar valores previos
    usuario.password = req.body.password;
    //borramos datos de los campos token y expira.
    usuario.token = undefined;
    usuario.expira = undefined;
    // Agregar y eliminar valores del objeto
    await usuario.save();
    // Redirigir
    req.flash('correcto', 'Password Modificado');
    res.redirect('/iniciar-sesion');
}