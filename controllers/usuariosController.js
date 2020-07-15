//una manera de llamar a la tabla
//const Vacante = require('../models/Vacantes')
//otra manera de llamar a la tabla
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
//sirve para subir imagenes
const multer = require('multer');
const shortid = require('shortid');
//express-validator 6.0->no profe
const { body, validationResult } = require('express-validator');

exports.subirImagen = (req, res, next) => {

    upload(req, res, function(error) {
        //cualquier error q haya se recoge aqui: ejem: el del formato de imagen q se detecto
        //y del tamaña del fichero
        if (error) {
            //solo si el error es de Multer
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'el archivo es muy grande:maximo 100 kb');
                } else { //para el resto de los errores de multer
                    req.flash('error', error.message)
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('/administracion')
            return;
        } else {
            return next();
        }
    })

};

// Opciones de MULTER
const configuracionMulter = {
        //el tamaño lo toma en bytes.tiene que ir como PRIMERA CONDICION
        limits: { fileSize: 100000 },
        //donde se van a almacenar los archivos q se suben
        //cb-> es como un next.(es un callback)-> null-> error. 
        storage: fileStorage = multer.diskStorage({

            destination: (req, file, cb) => {
                cb(null, __dirname + '../../public/uploads/perfiles');
            },
            //datos del fichero q se sube
            filename: (req, file, cb) => {
                const extension = file.mimetype.split('/')[1];
                cb(null, `${shortid.generate()}.${extension}`);
            }
        }),
        fileFilter(req, file, cb) {
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/png') {
                // El callback se ejecuta como true o false: TRUE: Cuando la imagen se acepta;
                cb(null, true);
            } else {
                cb(new Error('Formato de Imagen no valido.Solo JPEG y PNG'), false);
            }

        }
    }
    //imagen viene del html->imagen
const upload = multer(configuracionMulter).single('imagen');

//formulario crear cuenta usuario
exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crear tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
    });
}

//validar registro(se hace antes como middleware
//antes de guardar usuario)
exports.validarRegistro = async(req, res, next) => {
    //a partir de express 6.0 ya no se usa esto para sanitizar
    //req.sanitizeBody('nombre').escape();
    //a partir de esta versión se sanitiza->escape() y valida a la vez
    const rules = [
        // Campo Nombre
        body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        // Campo email
        body('email').isEmail().withMessage('El email debe ser valido').escape(),
        // Campo Password
        body('password').not().isEmpty().withMessage('El password no puede ir vacío').escape(),
        body('password').isLength(3).withMessage('El password debe tener 3 cifras o letras').escape(),
        // Campo confirmar Password
        body('confirmar').not().isEmpty().withMessage('Confirmar password no puede ir vacío').escape(),
        body('confirmar').equals(req.body.password).withMessage('El password es diferente').escape()
    ];

    await Promise.all(rules.map(validation => validation.run(req)));

    const errores = validationResult(req);

    // console.log(req.body);
    // console.log('objeto error completo', errores);
    // console.log('solo el array de errores', errores.array());

    if (errores.isEmpty()) {
        //pasar al ssgte middleware()->crearUsuario()
        return next();
    }

    req.flash('error', errores.array().map(error => error.msg));
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
        mensajes: req.flash()
    });
    return;
}


//guardar Usuario
exports.crearUsuario = async(req, res, next) => {
    //crear el usuario
    const usuario = new Usuarios(req.body);

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
        //error lanzado cuando se usa usuariosSchema.post(
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');

    }

}

//formulario para iniciar sesion
exports.formIniciarSesion = (req, res) => {
        res.render('iniciar-sesion', {
            nombrePagina: 'Iniciar Sesión DevJobs'
        });
    }
    //form editar perfil de usuario
exports.formEditarPerfil = (req, res) => {
        // console.log(req.user);
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en devJobs',
            //ojo!!!! passport-session
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen

        })

    }
    //guardar cambios editar perfil

exports.editarPerfil = async(req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    //si viene password nuevo solo se gu
    if (req.body.password) {
        usuario.password = req.body.password
    }
    if (req.file) {
        usuario.imagen = req.file.filename;
    }
    await usuario.save();
    //se visualiza el mensaje cuando se carga administracion
    req.flash('correcto', 'Cambios guardados Correctamente');

    res.redirect('/administracion');

}

//sanitizar y validar el formulario de editar perfiles
//  *******************METODO ACTUAL*********************

exports.validarPerfil = async(req, res, next) => {
    //console.log(req.body);

    const rules = [
        // Campo Nombre******
        body('nombre').not().isEmpty().withMessage('El nombre esObligatorio').escape(),
        // Campo eMail
        body('email').isEmail().withMessage('El email debe ser valido').escape(),

    ];
    if (req.body.password) {
        const rules = [
            // ***********Campo Password*************
            body('password').not().isEmpty().withMessage('El password no puede ir vacío').escape(),
            body('password').isLength(3).withMessage('El password debe tener 3 cifras o letras').escape(),
        ];
    }

    // console.log(req.user.password);

    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    // console.log(errores);

    if (errores.isEmpty()) {
        return next();
    }
    req.flash('error', errores.array().map(error => error.msg));
    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        mensajes: req.flash()
    })
    return;


    //******Subir Archivos en PDF*************/
    exports.subirCV = (req, res, next) => {
        upload(req, res, function(error) {
            if (error) {
                // console.log(error);
                if (error instanceof multer.MulterError) {
                    if (error.code === 'LIMIT_FILE_SIZE') {
                        req.flash('error', 'El Archivo es muy grande: Maximo 500kb');
                    } else {
                        req.flash('error', error.message);
                    }
                } else {
                    // console.log(error.message);
                    req.flash('error', error.message);
                }
                res.redirect('back');
                return;
            } else {
                return next();
            }

        });
    }
}