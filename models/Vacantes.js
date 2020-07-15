const mongoose = require('mongoose');
//para que las respuestas de mongoose sean promises
mongoose.Promise = global.Promise;
//importamos slug para generar las urls
const slug = require('slug');
//nos genera un "id unico en las url (campo bbdd)"
const shortid = require('shortid');

const vacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: 'el nombre de la vacante es obligatorio',
        //corta espacioes al inicio y final de cada dato de campo
        trim: true,
    },
    //empresa que contrata
    empresa: {
        type: String,
        trim: true,

    },
    ubicacion: {
        type: String,
        true: true,
        require: 'la ubicación es obligatoria'
    },
    salario: {
        type: String,
        default: 0
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },

    url: {
        type: String,
        lowercase: true
    },
    skills: [String],
    //arreglo de objetos
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        //clave externa al Model "Usuarios"
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es obligatorio'
    }


});
//funciona de la misma manera q "hooks": en Mongoose se conoce como middleware(validate, save, remove...)
vacantesSchema.pre('save', function(next) {

    //creamos la url
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;
    //siguiente middleware con next
    next();
})

//Crear un indice para el Buscador
vacantesSchema.index({ titulo: 'text' });

//aqui es DND LE DAMOS NOMBRE AL MODELO
module.exports = mongoose.model('Vacante', vacantesSchema);