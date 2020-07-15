//Importamos mongoose para mostrar vacantes
const mongoose = require('mongoose');
//importarmos el modelo
const Vacante = mongoose.model('Vacante');

exports.mostrarTrabajos = async(req, res, next) => {
    //ojo!!! para q handlebars lo lea, hay q añadir METDO lean()
    const vacantes = await Vacante.find().lean();
    //console.log(vacantes);
    if (!vacantes) return next();

    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y Publica Trabajo para Desarrolladores Web',
        barra: true,
        boton: true,
        vacantes


    })
}