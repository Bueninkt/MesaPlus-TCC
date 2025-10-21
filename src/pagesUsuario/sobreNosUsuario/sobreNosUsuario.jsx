import React from 'react';
import mainInicial from '../../components/mainInicial/mainInicial'; 
import navbarUsuario from '../../components/navbarUsuario/navbarUsuario';

const Main = mainInicial
const NavbarUsuario = navbarUsuario 

function sobreNosUsuarioPage(params) {
    return (
        <>
            <NavbarUsuario/>
            <Main/>
        </>
    )
}

export default sobreNosUsuarioPage