import React, { useState } from 'react';
import './MeuPerfilEmpresa.css';
import NavbarEmpresa from '../../components/navbarEmpresa/navbarEmpresa';
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';

// 1. Dados mockados (simulando um GET de endpoint)
const mockProfileData = {
    nome: "MC Donald's empresaaaaaaaaaaaass",
    senha: "password123", 
    endereco: "Rua Teste, 2000 - Jardim Teste, um lugar muito distante com um nome de rua muito longo",
    email: "mcDonalds-com-um-email-extremamente-longo-para-testar-o-scroll@gmail.com",
    telefone: "(11) 97890-0009",
    cnpj: "05.311.244/0001-09"
};

// Componente para um campo de perfil individual
// Ajuda a gerenciar a lógica de visualização/edição e o scroll
const PerfilCampo = ({ label, valor, isEditing, onChange, name, type = "text" }) => {
    // O campo CNPJ nunca é editável
    if (name === "cnpj") {
        isEditing = false;
    }
    // O campo Senha tem tratamento especial
    if (name === "senha" && !isEditing) {
        valor = "••••••••";
    }

    return (
        <div className="campo-container">
            <label className="campo-label">{label}:</label>
            <div className="campo-valor-wrapper">
                {isEditing ? (
                    <input 
                        type={type}
                        name={name}
                        value={valor}
                        onChange={onChange}
                        className="campo-input"
                        size={valor.length > 35 ? valor.length : 35}
                    />
                ) : (
                    <span className="campo-texto">{valor}</span>
                )}
            </div>
        </div>
    );
};


function MeuPerfilEmpresaPage() {
    // Estado para os dados do formulário
    const [formData, setFormData] = useState(mockProfileData);
    // Estado para o modo de edição
    const [isEditing, setIsEditing] = useState(false);
    // Estado para a imagem de perfil
    const [profileImage, setProfileImage] = useState(userDefaultEmpresa);

    // Função para lidar com a mudança da foto
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
        }
    };

    // Função para lidar com a mudança nos inputs
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Função para ATIVAR o modo de edição
    const handleEditClick = () => {
        setIsEditing(true);
    };

    // Função para ATUALIZAR (salvar) os dados e DESATIVAR o modo de edição
    const handleUpdate = () => {
        setIsEditing(false);
        // Simula o envio (PUT) para o servidor
        console.log("Dados atualizados (simulando PUT):", formData);
        // Aqui você faria a chamada real da API (axios.put, fetch, etc.)
    };


    return (
        <>
            <NavbarEmpresa />
            <div className="perfil-pagina-container">
                <div className="perfil-card">
                    
                    {/* Coluna da Foto */}
                    <div className="perfil-foto-container">
                        <img 
                            src={profileImage} 
                            alt="Foto da Empresa" 
                            className="perfil-imagem" 
                        />
                        
                        {/* * MUDANÇA APLICADA AQUI: 
                          * O <label> e o <input> só aparecem se isEditing for true 
                        */}
                        {isEditing && (
                            <>
                                <label htmlFor="file-upload" className="editar-foto-label">
                                    Editar foto
                                </label>
                                <input 
                                    id="file-upload" 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="file-input-hidden"
                                />
                            </>
                        )}
                    </div>

                    {/* Coluna dos Dados */}
                    <div className="perfil-dados-container">
                        <PerfilCampo 
                            label="Nome"
                            name="nome"
                            valor={formData.nome}
                            isEditing={isEditing}
                            onChange={handleChange}
                        />
                        <PerfilCampo 
                            label="Senha"
                            name="senha"
                            valor={formData.senha}
                            isEditing={isEditing}
                            onChange={handleChange}
                            type="password"
                        />
                        <PerfilCampo 
                            label="Endereço"
                            name="endereco"
                            valor={formData.endereco}
                            isEditing={isEditing}
                            onChange={handleChange}
                        />
                        <PerfilCampo 
                            label="Email"
                            name="email"
                            valor={formData.email}
                            isEditing={isEditing}
                            onChange={handleChange}
                            type="email"
                        />
                        <PerfilCampo 
                            label="Telefone"
                            name="telefone"
                            valor={formData.telefone}
                            isEditing={isEditing}
                            onChange={handleChange}
                        />
                        <PerfilCampo 
                            label="CNPJ"
                            name="cnpj"
                            valor={formData.cnpj}
                            isEditing={isEditing} // Será ignorado, pois o CNPJ não é editável
                            onChange={handleChange}
                        />

                        {/* Botões */}
                        <div className="perfil-botoes">
                            <button className="btn-editar" onClick={handleEditClick}>
                                Editar Perfil
                            </button>
                            <button className="btn-atualizar" onClick={handleUpdate}>
                                Atualizar
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default MeuPerfilEmpresaPage;