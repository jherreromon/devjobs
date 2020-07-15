import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
        const skills = document.querySelector('.lista-conocimientos');

        //limpiar las alertas q se quedan en pantalla fijas
        let alertas = document.querySelector('.alertas');

        if (alertas) {
            limpiarAlertas();
        }


        if (skills) {
            skills.addEventListener('click', agregarSkills);

            //una vez q estamos en editar, llamar la función
            skillsSeleccionados();

        }
        //desde ventana de administracion (botones, candidatos, editar, eliminar)
        const vacantesListado = document.querySelector('.panel-administracion');

        if (vacantesListado) {
            vacantesListado.addEventListener('click', accioneslistado);
        }

    })
    //utilizamos un "set" xq no permite agregar elementos repetidos
const skills = new Set();
//(e)->recoge el evento de hacer click
const agregarSkills = (e) => {
    //ojo!!! LI siempre en mayusculas
    if (e.target.tagName === 'LI') {
        if (e.target.classList.contains('activo')) {
            //quitar del set y quitar la clase "activo"
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');

        } else {
            //agregarlo al set "skill" y agregar la clase "activo"
            skills.add(e.target.textContent);
            //marcamos los q se van seleccionando
            //añadiendo la clase 'activo'.
            e.target.classList.add('activo');

        }
    }
    //con "object literal" convertimos el set en un arreglo
    const skillsArray = [...skills];
    //asignamos al campo type="hidden" id=skill 
    document.querySelector('#skills').value = skillsArray;
}


/*---------CUANDO ESTAMOS EN LA PAGINA DE EDCION DE UNA VACANTE #skills aparece vacio------------*/

const skillsSeleccionados = () => {
    //Devuelve en console(navegador) un "nodelist" y se convierte array con 
    //Array.from.     
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    seleccionadas.forEach(seleccionada => {
        //llenamos el Set skills con los skill seleccionados
        skills.add(seleccionada.textContent);
    })

    //con "object literal" convertimos el set en un arreglo
    const skillsArray = [...skills];
    //asignamos al campo type="hidden" id=skill 
    document.querySelector('#skills').value = skillsArray;


}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');
    const interval = setInterval(() => {
        if (alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        } else if (alertas.children.length === 0) {
            //una vez q el tag alerta esta a 0, eliminamos el contendor alertas.
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }

    }, 2000);
}

//eliminar Vacantes x axios
const accioneslistado = e => {
    //previene la ejecución (para q no ejecute la acción)
    e.preventDefault();

    //viene de data-eliminar en pag. administracion.html (boton eliminar)
    if (e.target.dataset.eliminar) {

        Swal.fire({
            title: '¿confirmar eliminación?',
            text: "Una vez eliminada, no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'No, cancelar'
        }).then((result) => {
            if (result.value) {

                //enviar la petición con AXIOS->url+_id d la vacante a eliminar
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                //Axios para eliminar
                axios.delete(url, { params: { url } })
                    .then(function(respuesta) {
                        if (respuesta.status === 200) {
                            Swal.fire(
                                'eliminado!',
                                respuesta.data,
                                'success'
                            )

                            //TODO: Elimininar del DOM
                            //console.log(e.target);
                            console.log(e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement));

                        }
                    });

            }
        }).catch(() => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'No se pudo eliminar'
            })
        })


        //eliminar x medio de axios      
    } else { //si pulsamos en los otros botones, accedemos al sitio
        window.location.href = e.target.href;
    }
}