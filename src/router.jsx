import React from "react";




{/*PagesEmpresa*/ }
import CadastrarAlimentosEmpresaPage from './pagesEmpresa/cadastrarAlimentosEmpresa/cadastrarAlimentosEmpresa.jsx'
import MeuPerfilEmpresaPage from './pagesEmpresa/meuPerfilEmpresa/meuPerfilEmpresa.jsx'
import SobreNosEmpresaPage from './pagesEmpresa/sobreNosEmpresa/sobreNosEmpresa.jsx';

{/*PagesOng */ }
import FavoritosOngPage from './pagesOng/FavoritosOng/FavoritosOng.jsx'
import HomeOngPage from './pagesOng/HomeOng/HomeOng.jsx'
import MeuPerfilOngPage from './pagesOng/meuPerfilOng/meuPerfilOng.jsx'
import MeusAlimentosOngPage from './pagesOng/meusAlimentosOng/meusAlimentosOng.jsx'
import SobreNosOngPage from './pagesOng/sobreNosOng/sobreNosOng.jsx';


{/*PagesUsuario */ }
import FavoritosUsuarioPage from './pagesUsuario/FavoritosUsuario/FavoritosUsuario.jsx'
import HomeUsuarioPage from './pagesUsuario/HomeUsuario/HomeUsuario.jsx'
import MeuPerfilUsuarioPage from './pagesUsuario/MeuPerfilUsuario/MeuPerfilUsuario.jsx'
import MeusAlimentosUsuarioPage from './pagesUsuario/meusAlimentosUsuario/meusAlimentosUsuario.jsx'
import SobreNosUsuarioPage from './pagesUsuario/sobreNosUsuario/sobreNosUsuario.jsx';


{/*PagesRegister */ }
import LoginPage from './pages/Login/Login.jsx';
import LadingPage from './pages/Lading/Landing.jsx'
import HudCadastrosPage from './pages/HudCadastros/HudCadastros.jsx'
import CadastroPessoaPage from './pages/CadastroPessoa/CadastroPessoa.jsx'
import CadastroEmpresaPage from './pages/CadastroEmpresa/CadastroEmpresa.jsx'
import CadastroOngPage from './pages/CadastroOng/CadastroOng.jsx'
import RecuperarSenhaParteEmailPage from './pages/RecuperarSenhaParteEmail/RecuperarSenhaParteEmail.jsx'
import RecuperarSenhaParteCodigoPage from './pages/RecuperarSenhaParteCodigo/RecuperarSenhaParteCodigo.jsx'
import RecuperarNovaSenhaPage from './pages/RecuperarNovaSenha/RecuperarNovaSenha.jsx'


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function AppRoutes() {
  return (
    <>
      <Routes>
        {/*RouteRegisters */}
        <Route path="/" element={<LadingPage />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/hudCadastros" element={<HudCadastrosPage />}></Route>
        <Route path="/cadastroPessoa" element={<CadastroPessoaPage />}></Route>
        <Route path="/cadastroEmpresa" element={< CadastroEmpresaPage />}></Route>
        <Route path="/cadastroOng" element={<CadastroOngPage />}></Route>
        <Route path="/recuperarSenhaParteEmail" element={<RecuperarSenhaParteEmailPage />}></Route>
        <Route path="/recuperarSenhaParteCodigo" element={<RecuperarSenhaParteCodigoPage />}></Route>
        <Route path="/recuperarNovaSenha" element={<RecuperarNovaSenhaPage />}></Route>

        {/*RouteEmpresa*/}
        <Route path="/cadastrarAlimentosEmpresa" element={<CadastrarAlimentosEmpresaPage />}></Route>
        <Route path="/meuPerfilEmpresa" element={<MeuPerfilEmpresaPage />}></Route>
        <Route path="/sobreNosEmpresa" element={<SobreNosEmpresaPage />}></Route>


        {/*RouteOng*/}
        <Route path="/favoritosOng" element={<FavoritosOngPage />}></Route>
        <Route path="/homeOng" element={<HomeOngPage />}></Route>
        <Route path="/meuPerfilOng" element={<MeuPerfilOngPage />}></Route>
        <Route path="/meusAlimentosOng" element={<MeusAlimentosOngPage />}></Route>
        <Route path="/sobreNosOng" element={<SobreNosOngPage />}></Route>

        {/*RouteUsuarios*/}
        <Route path="/favoritosUsuario" element={<FavoritosUsuarioPage />}></Route>
        <Route path="/homeUsuario" element={<HomeUsuarioPage />}></Route>
        <Route path="/meuPerfilUsuario" element={<MeuPerfilUsuarioPage />}></Route>
        <Route path="/meusAlimentosUsuario" element={<MeusAlimentosUsuarioPage />}></Route>
        <Route path="/sobreNosUsuario" element={<SobreNosUsuarioPage />}></Route>


      </Routes>
    </>
  )
}

export default AppRoutes