import React from 'react';
import mainInicial from '../../components/mainInicial/mainInicial'; 

import navbarOng from '../../components/navbarOng/navbarOng';

const Main = mainInicial
const NavbarOng = navbarOng

function sobreNosOngPage(params) {
    return (
        <>
            <NavbarOng/>
            <Main/>
        </>
    )
}

export default sobreNosOngPage