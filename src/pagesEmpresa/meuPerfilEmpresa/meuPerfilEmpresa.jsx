
import './MeuPerfilEmpresa.css'; 
import NavbarEmpresa from '../../components/navbarEmpresa/navbarEmpresa';
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';

function MeuPerfilEmpresaPage() {
    return (
        <>
            <NavbarEmpresa /> 

            <div className="meu-perfil-page-container">
                <div className="profile-card">
                    
                    {/* Layout principal: Ícone + Grid de Informações */}
                    <div className="profile-card-content">
                        
                        {/* Coluna 1: Ícone */}
                        <div className="profile-icon-wrapper">
                            <img src={userDefaultEmpresa} alt="Ícone do Perfil" className="profile-icon" />
                        </div>

                        {/* Coluna 2: Grid de Informações (A ESTRUTURA CORRETA) */}
                        <div className="profile-info-grid">
                            
                            {/* LINHA 1 do GRID */}
                            <div className="info-item">
                                <h1 className="profile-name">MC Donald's</h1>
                                <hr className="info-divider" />
                            </div>
                            <div className="info-item">
                                <p><strong>Senha:</strong> ********</p>
                                <hr className="info-divider" />
                            </div>

                            {/* LINHA 2 do GRID */}
                            <div className="info-item">
                                <p><strong>Endereço:</strong> Rua Teste, 2000 - Jardim Teste</p>
                                <hr className="info-divider" />
                            </div>
                            <div className="info-item">
                                <p><strong>Email:</strong> mcDonalds@gmail.com</p>
                                <hr className="info-divider" />
                            </div>

                            {/* LINHA 3 do GRID */}
                            <div className="info-item">
                                <p><strong>Telefone:</strong> (11) 97890-0009</p>
                                <hr className="info-divider" />
                            </div>
                            <div className="info-item">
                                <p><strong>CNPJ:</strong> 05.311.244/0001-09</p>
                                <hr className="info-divider" />
                            </div>
                        </div>
                    </div>

                    {/* Rodapé do Card: Botões */}
                    <div className="profile-card-footer">
                        <button className="btn btn-secondary">Editar Perfil</button>
                        <button className="btn btn-primary">atualizar</button> 
                    </div>

                </div>
            </div>
        </>
    );
}

export default MeuPerfilEmpresaPage;