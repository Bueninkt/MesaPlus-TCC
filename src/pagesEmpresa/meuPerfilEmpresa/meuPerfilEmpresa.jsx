import React, { useState } from 'react';
import './MeuPerfilEmpresa.css';
import NavbarEmpresa from '../../components/navbarEmpresa/navbarEmpresa';
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';

// 1. Imports dos ícones adicionados
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";

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
// *** COMPONENTE MODIFICADO ***
const PerfilCampo = ({ label, valor, isEditing, onChange, name, type = "text" }) => {
    
    // 2. Estado local para visibilidade da senha
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    // 3. Verifica se é o campo de senha
    const isPasswordField = name === "senha";

    // 4. Função para alternar a visibilidade
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prev => !prev);
    };

    // 5. Determina o valor e o tipo a serem exibidos
    let displayValue = valor;
    let inputType = type;

    if (isPasswordField) {
        if (isEditing) {
            // Se estiver editando, alterna o tipo do input
            inputType = isPasswordVisible ? "text" : "password";
        } else {
            // Se estiver visualizando, alterna o texto
            displayValue = isPasswordVisible ? valor : '•'.repeat(valor.length);
        }
    }

    return (
        <div className="campo-container">
            <label className="campo-label">{label}:</label>
            {/* 6. Adiciona classe wrapper para estilização do ícone */}
            <div className={`campo-valor-wrapper ${isPasswordField ? 'password-field-wrapper' : ''}`}>
                {isEditing ? (
                    <input 
                        type={inputType} // 7. Usa o tipo dinâmico
                        name={name}
                        value={valor}
                        onChange={onChange}
                        className="campo-input"
                        // Mantém a lógica de 'size' original
                        size={valor.length > 35 ? valor.length : 35}
                    />
                ) : (
                    <span className="campo-texto">{displayValue}</span> // 8. Usa o valor dinâmico
                )}
                
                {/* 9. Renderiza o ícone se for o campo de senha */}
                {isPasswordField && (
                    <img
                        src={isPasswordVisible ? eyeclosed : eye}
                        alt={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                        className="password-toggle-icon"
                        onClick={togglePasswordVisibility}
                    />
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
                            type="password" // O tipo inicial ainda é password
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
                            isEditing={isEditing} 
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