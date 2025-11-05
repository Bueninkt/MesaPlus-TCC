import React, { useState } from 'react';
import './MeuPerfilEmpresa.css';
import NavbarEmpresa from '../../components/navbarEmpresa/navbarEmpresa';
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';

// 1. Imports dos ícones adicionados
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";

// 1. Dados mockados (simulando um GET de endpoint) - SEM ALTERAÇÃO
const mockProfileData = {
    nome: "MC Donald's empresaaaaaaaaaaaass",
    senha: "password123", 
    endereco: "Rua Teste, 2000 - Jardim Teste, um lugar muito distante com um nome de rua muito longo",
    email: "mcDonalds-com-um-email-extremamente-longo-para-testar-o-scroll@gmail.com",
    telefone: "(11) 97890-0009",
    cnpj: "05.311.244/0001-09"
};

// --- INÍCIO: NOVAS CONSTANTES E FUNÇÕES ---

// --- Constantes do Azure ---
const AZURE_ACCOUNT = 'mesaplustcc';
const AZURE_CONTAINER = 'fotos';
const SAS_TOKEN = 'sp=racwdl&st=2025-10-23T12:41:46Z&se=2025-12-16T13:00:00Z&sv=2024-11-04&sr=c&sig=MzeTfPe%2Bns1vJJvi%2BazLsTIPL1YDBP2z7tDTlctlfyI%3D';

// --- Função de Upload ---
const uploadParaAzure = async (file, idEmpresa) => {
    // Usar um ID fixo para a simulação, já que não temos um ID real
    const idUsuario = idEmpresa || 'empresa_mock_id_001'; 
    const blobName = `${idUsuario}_${Date.now()}_${file.name}`;
    const url = `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}?${SAS_TOKEN}`;
    
    console.log("Iniciando upload para Azure:", blobName);

    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type },
        body: file
    });

    if (!res.ok) {
        console.error("Falha no upload para Azure:", res.statusText);
        throw new Error(`Azure retornou status ${res.status}`);
    }
    
    const finalUrl = `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}`;
    console.log("Upload concluído. URL:", finalUrl);
    return finalUrl;
};

// --- Funções de Máscara ---
const maskPhone = (v) => {
    let n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length > 10) {
        n = n.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (n.length > 6) {
        n = n.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (n.length > 2) {
        n = n.replace(/^(\d{2})(\d*)/, "($1) $2");
    } else if (n.length > 0) {
        n = n.replace(/^(\d*)/, "($1");
    }
    return n;
};

const maskCNPJ = (v) => {
    return v.replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
};

// --- Função de Validação ---
const validateField = (name, value) => {
    switch (name) {
        case "nome":
            if (!value) return "Nome é obrigatório.";
            if (!/^[A-ZÀ-ÖØ-Þ]/.test(value)) {
                return "O nome deve começar com letra maiúscula.";
            }
            return "";

        case "email":
            if (!value) return "Email é obrigatório.";
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(value)) {
                return "Formato de email inválido (ex: nome@dominio.com).";
            }
            return "";

        case "senha":
            if (!value) return "Senha é obrigatória.";
            if (value.length < 10) return "Senha deve ter no mínimo 10 caracteres.";
            if (value.length > 15) return "Senha deve ter no máximo 15 caracteres.";
            if (!/(?=.*[A-Z])/.test(value)) return "Deve conter uma letra maiúscula.";
            if (!/(?=.*[a-z])/.test(value)) return "Deve conter uma letra minúscula.";
            if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) return "Deve conter um caractere especial.";
            return "";

        case "telefone":
            const phoneDigits = value.replace(/\D/g, "");
            if (phoneDigits.length < 10) return "Telefone deve ter 10 ou 11 dígitos.";
            return "";

        case "cnpj":
            const cnpjDigits = value.replace(/\D/g, "");
            if (cnpjDigits.length !== 14) return "CNPJ/MEI deve ter 14 dígitos.";
            return "";
        
        case "endereco":
             if (!value) return "Endereço é obrigatório.";
             return "";
        
        default:
            return "";
    }
};

// --- FIM: NOVAS CONSTANTES E FUNÇÕES ---


// *** COMPONENTE MODIFICADO ***
// Adicionada a prop 'error'
const PerfilCampo = ({ label, valor, isEditing, onChange, name, type = "text", error }) => {
    
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = name === "senha";

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prev => !prev);
    };

    let displayValue = valor;
    let inputType = type;

    if (isPasswordField) {
        if (isEditing) {
            inputType = isPasswordVisible ? "text" : "password";
        } else {
            displayValue = isPasswordVisible ? valor : '•'.repeat(valor.length);
        }
    }

    return (
        // O container agora inclui o erro
        <div className="campo-container">
            <label className="campo-label">{label}:</label>
            <div className={`campo-valor-wrapper ${isPasswordField ? 'password-field-wrapper' : ''}`}>
                {isEditing ? (
                    <input 
                        type={inputType} 
                        name={name}
                        value={valor}
                        onChange={onChange}
                        // Adiciona classe de erro dinamicamente
                        className={`campo-input ${error ? 'input-error' : ''}`} 
                        size={valor.length > 35 ? valor.length : 35}
                    />
                ) : (
                    <span className="campo-texto">{displayValue}</span> 
                )}
                
                {isPasswordField && (
                    <img
                        src={isPasswordVisible ? eye : eyeclosed}
                        alt={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                        className="password-toggle-icon"
                        onClick={togglePasswordVisibility}
                    />
                )}
            </div>
            {/* Exibe a mensagem de erro se ela existir */}
            {error && <span className="campo-erro">{error}</span>} 
        </div>
    );
};


function MeuPerfilEmpresaPage() {
    // Estados do componente
    const [formData, setFormData] = useState(mockProfileData);
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(userDefaultEmpresa);

    // --- NOVOS ESTADOS ---
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null); // Armazena o ARQUIVO da imagem

    // --- FUNÇÕES MODIFICADAS ---

    // Função para lidar com a mudança da foto
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file)); // Atualiza o preview
            setSelectedFile(file); // Armazena o arquivo para upload
            // Limpa o erro de imagem se houver
            setErrors(prev => ({ ...prev, imagem: "" })); 
        }
    };

    // Função para lidar com a mudança nos inputs (com máscara e validação)
    const handleChange = (event) => {
        const { name, value } = event.target;
        
        let maskedValue = value;

        // 1. Aplicar Máscaras
        if (name === "telefone") {
            maskedValue = maskPhone(value);
        } else if (name === "cnpj") {
            maskedValue = maskCNPJ(value);
        }

        // 2. Atualizar o estado do formulário
        setFormData(prevData => ({
            ...prevData,
            [name]: maskedValue
        }));

        // 3. Validar o campo
        const errorMessage = validateField(name, maskedValue);
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: errorMessage
        }));
    };

    // Função para ATIVAR o modo de edição (limpa erros)
    const handleEditClick = () => {
        setIsEditing(true);
        setErrors({}); // Limpa erros antigos
        setSelectedFile(null); // Limpa seleção de arquivo
    };

    // Função para ATUALIZAR (com validação e upload)
    const handleUpdate = async () => {
        
        // 1. Validar todos os campos do formulário
        const validationErrors = {};
        Object.keys(formData).forEach(name => {
            const error = validateField(name, formData[name]);
            if (error) {
                validationErrors[name] = error;
            }
        });

        // 2. Validar a imagem (opcional, descomente se for obrigatória)
        // if (profileImage === userDefaultEmpresa && !selectedFile) {
        //     validationErrors.imagem = "A foto é obrigatória.";
        // }

        setErrors(validationErrors);

        // 3. Verificar se há erros
        if (Object.keys(validationErrors).length > 0) {
            console.log("Falha na validação:", validationErrors);
            return; // Impede a atualização
        }

        // 4. Se a validação passou...
        setIsEditing(false);
        let finalImageUrl = profileImage; // URL de preview ou antiga

        // 5. Fazer upload para Azure se um *novo* arquivo foi selecionado
        if (selectedFile) {
            try {
                console.log("Enviando imagem para o Azure...");
                const azureUrl = await uploadParaAzure(selectedFile); 
                finalImageUrl = azureUrl; // Usa a URL real do Azure
                
            } catch (error) {
                console.error("Erro ao fazer upload da imagem:", error);
                setErrors(prev => ({ ...prev, imagem: "Falha no upload da imagem." }));
                setIsEditing(true); // Permanece no modo de edição
                return;
            }
        }

        // 6. Simular o envio (PUT) para o servidor
        const dadosParaEnviar = {
            ...formData,
            fotoUrl: finalImageUrl // Adiciona a URL da imagem
        };

        console.log("Dados atualizados (simulando PUT):", dadosParaEnviar);
        setSelectedFile(null); // Limpa o arquivo após o sucesso
    };


    return (
        <>
            <NavbarEmpresa />
            <div className="perfil-pagina-container">
                <div className="perfil-card">
                    
                    {/* Coluna da Foto (com exibição de erro) */}
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
                                {/* Exibe erro de imagem */}
                                {errors.imagem && <span className="campo-erro-foto">{errors.imagem}</span>}
                            </>
                        )}
                    </div>

                    {/* Coluna dos Dados (passando a prop 'error' para cada campo) */}
                    <div className="perfil-dados-container">
                        <PerfilCampo 
                            label="Nome"
                            name="nome"
                            valor={formData.nome}
                            isEditing={isEditing}
                            onChange={handleChange}
                            error={errors.nome}
                        />
                        <PerfilCampo 
                            label="Senha"
                            name="senha"
                            valor={formData.senha}
                            isEditing={isEditing}
                            onChange={handleChange}
                            type="password"
                            error={errors.senha}
                        />
                        <PerfilCampo 
                            label="Endereço"
                            name="endereco"
                            valor={formData.endereco}
                            isEditing={isEditing}
                            onChange={handleChange}
                            error={errors.endereco}
                        />
                        <PerfilCampo 
                            label="Email"
                            name="email"
                            valor={formData.email}
                            isEditing={isEditing}
                            onChange={handleChange}
                            type="email"
                            error={errors.email}
                        />
                        <PerfilCampo 
                            label="Telefone"
                            name="telefone"
                            valor={formData.telefone}
                            isEditing={isEditing}
                            onChange={handleChange}
                            error={errors.telefone}
                        />
                        <PerfilCampo 
                            label="CNPJ"
                            name="cnpj"
                            valor={formData.cnpj}
                            isEditing={isEditing} 
                            onChange={handleChange}
                            error={errors.cnpj}
                        />

                        {/* Botões */}
                        <div className="perfil-botoes">
                            <button className="btn-editar" onClick={handleEditClick}>
                                Editar Perfil
                            </button>
                            {/* Desabilita o botão se estiver editando E houver erros */}
                            <button 
                                className="btn-atualizar" 
                                onClick={handleUpdate}
                                disabled={isEditing && Object.keys(errors).some(key => errors[key] !== "")}
                            >
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