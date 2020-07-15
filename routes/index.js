const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    //crear vacantes
    router.get('/vacantes/nueva',
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    );

    router.post('/vacantes/nueva',
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    );

    //mostrar una vacante cuando se pica en el botón de "info" de una de ellas.
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    //editar Vacante
    router.get('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacantesController.formEditarVacante
    );

    router.post('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacante
    );

    //Eliminar Vacantes
    router.delete('/vacantes/eliminar/:id',
        vacantesController.eliminarVacante
    )


    //Crear Cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
        usuariosController.validarRegistro,
        usuariosController.crearUsuario
    );

    //autenticar Usuarios

    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);



    //cerrar sesion
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    //resetear password
    //Resetear Password(emails)
    router.get('/reestablecer-password',
        authController.formReestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken);

    //resetear Password y almacenar en la bbdd
    router.get('/reestablecer-password/:token',
        authController.reestablecerPassword);

    router.post('/reestablecer-password/:token',
        authController.guardarPassword);



    //panel de administracion de usuarios
    router.get('/administracion',
        authController.verificarUsuario,
        authController.mostrarPanel
    );
    //editar perfil OJO!!!!->router.get
    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.formEditarPerfil,

    );

    router.post('/editar-perfil',
            authController.verificarUsuario,
            // usuariosController.validarPerfil,
            usuariosController.subirImagen,
            usuariosController.editarPerfil
        )
        /************Recibir mensajes de candidatos***************/
    router.post('/vacantes/:url',
        vacantesController.subirCV,
        vacantesController.contactar
    );

    //**********Muestra los candidatos por Vacante***********/
    router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacantesController.mostrarCandidatos
    );

    // Buscador de Vacantes
    router.post('/buscador', vacantesController.buscarVacantes);

    //importante poner return si no funciona
    return router;
}