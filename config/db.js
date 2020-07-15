const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

//lo he actualizado, ya que daba warning deprecated
mongoose.connect(process.env.DATABASE, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });

mongoose.connection.on('error', (error) => {
    console.log(error);
})

//importamos los modelos en la CONFIGURACIÓN

require('../models/Vacantes');
require('../models/Usuarios');