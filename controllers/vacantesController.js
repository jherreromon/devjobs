//una manera de llamar a la tabla
//const Vacante = require('../models/Vacantes')

//otra manera de llamar a la tabla
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
//express-validator 6.0->No profe
const { body, validationResult } = require('express-validator');

const multer = require('multer');
const shortid = require('shortid');


exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
}

//agregar las vacantes a la bbdd

exports.agregarVacante = async(req, res) => {
    const vacante = new Vacante(req.body);
    //console.log(req);
    //usuario autor de la vacante->passort.session
    //ojo!!! no viene con el req.body
    vacante.autor = req.user._id;

    //crear arreglo de habilidades (skills)

    vacante.skills = req.body.skills.split(',');
    //almacenarlo en la bbdd


    const nuevaVacante = await vacante.save();
    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

exports.mostrarVacante = async(req, res, next) => {
        //ojo!! añadir lean() SI NO Con MONGOOSE<->HANDLEBAR no funciona
        //populate->hace referencia a las relaciones
        const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor').lean();
        console.log(vacante);
        //sin no hay resultados siguiente middleware
        if (!vacante) {
            return next();
        }
        res.render('vacante', {
            vacante,
            nombrePagina: vacante.titulo,
            barra: true

        })
    }
    //ponemos next, por si no existe la vacante
exports.formEditarVacante = async(req, res, next) => {
    //ojo. añadir lean(). sino no funciona x version moderna
    const vacante = await Vacante.findOne({ url: req.params.url }).lean();

    if (!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.editarVacante = async(req, res, next) => {
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(',');
    //new:true-> para q guarde los cambios actualizados
    const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, {
        new: true,
        runValidators: true
    }).lean();

    res.redirect(`/vacantes/${vacante.url}`);

}

//validar y sanitizar los campos de las nuevas vacantes
//con express-validatorm.ojo!!!! version 6 <> al video del  profesor

exports.validarVacante = async(req, res, next) => {
    // Sanitizar los campos
    const rules = [
        //*****SANITIZAR Y VALIDAR********* */
        // Campo Titulo
        body('titulo').not().isEmpty().withMessage('Agrega un titulo').escape(),

        // Campo 
        body('empresa').not().isEmpty().withMessage('Hay que poner Nombre de Empresa').escape(),

        // Campo Ubicacion
        body('ubicacion').not().isEmpty().withMessage('Pon una Ubicacion').escape(),

        // Campo Salario-> no se revisa ya q x defecto es cero
        body('salario').escape(),

        // Campo Contrato
        body('contrato').not().isEmpty().withMessage('Elije un tipo de contrato').escape(),

        // Campo Skills
        body('skills').not().isEmpty().withMessage('Agrega una habilidad por lo menos').escape()
    ];
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);

    if (errores.isEmpty()) {
        return next();
    }
    req.flash('error', errores.array().map(error => error.msg));
    // console.log(errores);

    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el Formulario y publica una Vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        mensajes: req.flash()
    })
    return; //sgte Middleware
}

// Metodo para Eliminar Vacante
//vamos a trabajar con AXIOS PARA ELIMINAR.
exports.eliminarVacante = async(req, res) => {
    const { id } = req.params;
    const vacante = await Vacante.findById(id);

    // ojo req.user-> viene de passport (usuario validado)
    if (verificarAutor(vacante, req.user)) {
        // Usuario ok , se puede eliminar
        //vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        // No es el usuario correcto no elimina
        res.status(403).send('Error');
    }

}
const verificarAutor = (vacante = {}, usuario = {}) => {
    //equals->metodo de ORM Mongoose.
    if (!vacante.autor.equals(usuario._id)) {
        return false;
    }
    return true;
}

/*******************************Subir Archivos en PDF********************************/

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
            //back intenta hacer peticion a una nuea pagina. Pero si hay error regresa a la q estamos
            res.redirect('back');
            return;
        } else {
            return next();
        }

    });
}

const configuracionMulter = {
        limits: { fileSize: 500000 },
        storage: fileSorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname + '../../public/uploads/cv');
            },
            filename: (req, file, cb) => {
                // console.log(file);
                const extension = file.mimetype.split('/')[1];
                cb(null, `${shortid.generate()}.${extension}`);
            }
        }),
        fileFilter(req, file, cb) {
            //mimetype para pdf-> application/pdf
            if (file.mimetype === 'application/pdf') {
                // El callback se ejecuta como true o false: TRUE: Cuando la imagen se acepta;
                cb(null, true);
            } else {
                cb(new Error('Formato  no valido'), false);
            }
        }
    }
    //cv-> es el campo del fichero html vacantes.handlebars
const upload = multer(configuracionMulter).single('cv');

// ****************Almacenar los candidatos en la DB*********************//

exports.contactar = async(req, res, next) => {
    // console.log(req.params.url);
    const vacante = await Vacante.findOne({ url: req.params.url });

    // Sí no existe la Vacante Salimos
    if (!vacante) return next();

    // Todo Bien construir el nuevo Objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        //req.file->lo genera multer
        cv: req.file.filename
    }

    // Almacenar la Vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();
    console.log(vacante);


    // Mensaje Flash y redireccion
    req.flash('correcto', 'Se envio tu CV correctamente');
    res.redirect('/');
}

exports.mostrarCandidatos = async(req, res, next) => {
        // console.log(req.params.id);
        const vacante = await Vacante.findById(req.params.id);
        // console.log(vacante);
        console.log(vacante.autor);
        console.log(req.user._id);

        //son del tipo object los dos peeeero no son object iguales
        // console.log(typeof vacante.autor);
        // console.log(typeof req.user._id);

        // return;

        if (vacante.autor != req.user._id.toString()) {
            return next();
        }
        //si no encuentra vacante
        if (!vacante) return next();

        res.render('candidatos', {
                nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
                cerrarSesion: true,
                nombre: req.user.nombre,
                imagen: req.user.imagen,
                candidatos: vacante.candidatos
            })
            // console.log('Pasamos la validacion');
    }
    // Buscador de Vacantes 
exports.buscarVacantes = async(req, res, next) => {
    const vacantes = await Vacante.find({
        //$text y $search son métodos de mongoDB (No usa Mongoose)
        $text: {
            $search: req.body.q
        }
    });
    // console.log(vacante);
    // Mostrar las vacantes
    res.render('home', {
        nombrePagina: `Resultados para la busqueda: ${req.body.q}`,
        barra: true,
        vacantes
    })
}