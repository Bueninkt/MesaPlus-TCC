import React from 'react';
import mainInicial from '../../components/mainInicial/mainInicial'; 
import navbarEmpresa from '../../components/navbarEmpresa/navbarEmpresa';

const NavbarEmpresa = navbarEmpresa;
const Main = mainInicial


function sobreNosEmpresaPage(params) {
    return (
        <>
            <NavbarEmpresa/>
            <Main/>
        </>
    )
}

export default sobreNosEmpresaPage