module.exports = {
    //los parámetros se pasan x defecto gracias a q es un helpers
    seleccionarSkills: (seleccionadas = [], opciones) => {
        //console.log(seleccionadas);
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox',
            'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS',
            'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP',
            'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize',
            'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'
        ];

        let html = '';
        skills.forEach(skill => {
            //seleccionadas->recoge los skills que ha seleccionado el usuario y pone clase "activo"
            //html+= `<li>$(skill)</li>`
            html += `
             <li ${seleccionadas.includes(skill)? 'class="activo"' : ''}>${skill}</li>
             `;
        });
        return opciones.fn().html = html
    },
    //----va en en el editar-vacante.handlebars->"select contrato"
    //seleccionado->elemento seleccionado en la bbdd
    //opciones->diferentes opcines del select
    tipoContrato: (seleccionado, opciones) => {
        return opciones.fn(this).replace(
            //cuando encuentre el valor seleccinado le agrega el atributo selected
            new RegExp(` value="${seleccionado}"`), '$& selected="selected"'
        )
    },
    mostrarAlertas: (errores = {}, alertas) => {
        // console.log(alertas.fn(this));
        // console.log('=======');
        // console.log(errores);

        const categoria = Object.keys(errores);
        // console.log(categoria);
        // console.log(errores[categoria]);
        let html = '';
        if (categoria.length) {
            errores[categoria].forEach(error => {
                html += `<div class="${categoria} alerta">
                      ${error}  
                </div>`;
            })
        }
        //console.log(html);
        return alertas.fn().html = html;
    }
}