const mongoose = require('mongoose');
//para que las respuestas de mongoose sean promises
mongoose.Promise = global.Promise;
//hasheado de password
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
    email: {
        type: String,
        //no se puede poner con mongoose mensaje validador
        //par campos con propiedad unique
        unique: true,
        lowercase: true,
        //quita posibles espacios al principio o al final 
        trim: true,
    },
    nombre: {
        type: String,

        require: true,
    },
    password: {
        type: String,
        required: true,
        trim: true

    },
    //para resetear los password
    token: String,
    expira: Date,
    imagen: String

})

//Métodos para hashear los passwords con bcrypt
usuariosSchema.pre('save', async function(next) {
    //si el password ya esta hasheado no hacemos nada
    //isModified->Mongoose
    if (!this.isModified('password')) {
        return next();
    }
    //si no está hasheado lo hasheamos
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});
//hay que capturar el error q da al intentar guardar el mismso correo varias veces
//hay que pasar los tres parámetros (error, doc, next)->
//->aunq no se utilicen
usuariosSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next('Ese correo ya esta registrado');

    } else {
        next(error);
    }
});

//Autenticar Usuarios con moongose: (en sequalize se utiliza un protototipe)
usuariosSchema.methods = {
    compararPassword: function(password) {
        //this.password-> el hasheado
        return bcrypt.compareSync(password, this.password);
    }
}




module.exports = mongoose.model('Usuarios', usuariosSchema);