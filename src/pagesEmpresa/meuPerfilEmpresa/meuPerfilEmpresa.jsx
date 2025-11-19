import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirecionar se não houver login
import './MeuPerfilEmpresa.css';
import NavbarEmpresa from '../../components/navbarEmpresa/navbarEmpresa';
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';

// --- Constantes do Azure ---
const AZURE_ACCOUNT = 'mesaplustcc';
const AZURE_CONTAINER = 'fotos';
const SAS_TOKEN = 'sp=racwdl&st=2025-10-23T12:41:46Z&se=2025-12-16T13:00:00Z&sv=2024-11-04&sr=c&sig=MzeTfPe%2Bns1vJJvi%2BazLsTIPL1YDBP2z7tDTlctlfyI%3D';

// --- Função de Upload ---
const uploadParaAzure = async (file, idEmpresa) => {
    const blobName = `${idEmpresa}_${Date.now()}_${file.name}`;
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
    if (!v) return "";
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
    if (!v) return "";
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

        case "telefone":
            const phoneDigits = value.replace(/\D/g, "");
            if (phoneDigits.length < 10) return "Telefone deve ter 10 ou 11 dígitos.";
            return "";
        
        default:
            return "";
    }
};

// *** COMPONENTE CAMPO SIMPLIFICADO (Sem lógica de senha) ***
const PerfilCampo = ({ label, valor, isEditing, onChange, name, type = "text", error, disabled = false }) => {
    return (
        <div className="campo-container">
            <label className="campo-label">{label}:</label>
            
            <div className="campo-valor-wrapper">
                <div className="campo-scroll-container">
                    {isEditing && !disabled ? (
                        <input 
                            type={type} 
                            name={name}
                            value={valor}
                            onChange={onChange}
                            className={`campo-input ${error ? 'input-error' : ''}`} 
                            size={valor.length > 36 ? valor.length : 36}
                        />
                    ) : (
                         isEditing && disabled ? (
                            <input 
                                type="text" 
                                value={valor} 
                                disabled 
                                className="campo-input input-disabled"
                                size={valor.length > 36 ? valor.length : 36}
                            />
                         ) : (
                            <span className="campo-texto">{valor}</span> 
                         )
                    )}
                </div>
            </div>
            {error && <span className="campo-erro">{error}</span>} 
        </div>
    );
};


function MeuPerfilEmpresaPage() {
    const navigate = useNavigate();
    
    // Estado inicial vazio
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "", // Mantemos no estado para lógica interna, mas não exibimos
        telefone: "",
        cnpj: "",
        endereco: ""
    });

    // Estado de Backup
    const [originalData, setOriginalData] = useState({});

    const [originalPasswordHash, setOriginalPasswordHash] = useState("");
    const [idEmpresa, setIdEmpresa] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(userDefaultEmpresa);
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false); 

    // --- 1. CARREGAR DADOS AO ENTRAR NA PÁGINA ---
    useEffect(() => {
        const fetchEmpresaData = async () => {
            try {
                const userStorage = localStorage.getItem("user");
                if (!userStorage) {
                    alert("Usuário não autenticado.");
                    navigate("/login");
                    return;
                }

                const user = JSON.parse(userStorage);
                setIdEmpresa(user.id);
                setIsLoading(true);
                
                const response = await fetch(`http://localhost:8080/v1/mesa-plus/empresa/${user.id}`);
                
                if (!response.ok) throw new Error("Erro ao buscar dados da empresa");

                const data = await response.json();

                if (data.status && data.empresa) {
                    const emp = data.empresa;
                    
                    const initialData = {
                        nome: emp.nome,
                        email: emp.email,
                        senha: emp.senha,
                        telefone: maskPhone(emp.telefone),
                        cnpj: maskCNPJ(emp.cnpj_mei),
                        endereco: ""
                    };

                    setFormData(initialData);

                    setOriginalData({
                        ...initialData,
                        fotoUrl: emp.foto 
                    });

                    setOriginalPasswordHash(emp.senha); 

                    if (emp.foto) {
                        setProfileImage(emp.foto);
                    }
                }

            } catch (error) {
                console.error("Erro de conexão:", error);
                alert("Não foi possível carregar os dados do perfil.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmpresaData();
    }, [navigate]);


    // --- FUNÇÕES DE MANIPULAÇÃO ---

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
            setSelectedFile(file);
            setErrors(prev => ({ ...prev, imagem: "" })); 
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        let maskedValue = value;

        if (name === "telefone") {
            maskedValue = maskPhone(value);
        } else if (name === "cnpj") {
            maskedValue = maskCNPJ(value);
        }

        setFormData(prevData => ({
            ...prevData,
            [name]: maskedValue
        }));

        const errorMessage = validateField(name, maskedValue);
        setErrors(prevErrors => ({ ...prevErrors, [name]: errorMessage }));
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setErrors({});
        setSelectedFile(null);
    };

    // --- Função de Cancelar ---
    const handleCancel = () => {
        setFormData({
            nome: originalData.nome,
            email: originalData.email,
            senha: originalData.senha,
            telefone: originalData.telefone,
            cnpj: originalData.cnpj,
            endereco: originalData.endereco
        });

        setProfileImage(originalData.fotoUrl || userDefaultEmpresa);
        setSelectedFile(null);
        setErrors({});
        setIsEditing(false);
    };

    // --- ATUALIZAR DADOS (PUT) ---
    const handleUpdate = async () => {
        const validationErrors = {};
        Object.keys(formData).forEach(name => {
            if(name !== 'endereco' && name !== 'cnpj' && name !== 'senha') {
                const error = validateField(name, formData[name]);
                if (error) validationErrors[name] = error;
            }
        });

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        try {
            setIsLoading(true);
            let finalImageUrl = profileImage;

            if (selectedFile) {
                finalImageUrl = await uploadParaAzure(selectedFile, idEmpresa); 
            }

            const dadosParaEnviar = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone, 
                foto: finalImageUrl !== userDefaultEmpresa ? finalImageUrl : null
            };

            // A senha só é enviada se fosse alterada no form, mas como removemos o campo,
            // ela nunca mudará aqui, mantendo a lógica de segurança.
            if (formData.senha !== originalPasswordHash) {
                dadosParaEnviar.senha = formData.senha;
            }

            const response = await fetch(`http://localhost:8080/v1/mesa-plus/empresa/${idEmpresa}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaEnviar)
            });

            if (!response.ok) {
                const errorTxt = await response.text();
                throw new Error(errorTxt || "Erro ao atualizar perfil");
            }

            const result = await response.json();

            if (result.status) {
                alert("Perfil atualizado com sucesso!");
                setIsEditing(false);
                setSelectedFile(null);
                
                setOriginalData({
                    ...formData,
                    fotoUrl: finalImageUrl
                });
            } else {
                alert("Erro ao atualizar: " + (result.message || "Erro desconhecido"));
            }

        } catch (error) {
            console.error("Erro no update:", error);
            alert("Falha ao atualizar os dados. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };


    if (isLoading && !formData.nome) {
        return <div className="perfil-pagina-container"><p>Carregando perfil...</p></div>;
    }

    return (
        <>
            <NavbarEmpresa />
            <div className="perfil-pagina-container">
                <div className="perfil-card">
                    
                    {/* Coluna da Foto */}
                    <div className="perfil-foto-container">
                        <img 
                            src={profileImage || userDefaultEmpresa} 
                            alt="Foto da Empresa" 
                            className="perfil-imagem" 
                        />
                        
                        {isEditing && (
                            <>
                                <label htmlFor="file-upload" className="editar-foto-label">
                                    {isLoading ? "Enviando..." : "Editar foto"}
                                </label>
                                <input 
                                    id="file-upload" 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="file-input-hidden"
                                    disabled={isLoading}
                                />
                                {errors.imagem && <span className="campo-erro-foto">{errors.imagem}</span>}
                            </>
                        )}
                    </div>

                    {/* Coluna dos Dados */}
                    <div className="perfil-dados-container">
                        <PerfilCampo label="Nome" name="nome" valor={formData.nome} isEditing={isEditing} onChange={handleChange} error={errors.nome} />
                        
                        {/* --- ALTERAÇÃO: Campo de Senha substituído pelo link --- */}
                        <div className="campo-container">
                            <label className="campo-label">Senha:</label>
                            <div className="campo-valor-wrapper">
                                <div className="campo-scroll-container">
                                    <span 
                                        className="campo-texto" 
                                        onClick={() => navigate('/recuperarNovaSenha')}
                                        style={{ 
                                            cursor: 'pointer', 
                                            textDecoration: 'underline', 
                                            fontWeight: '500',
                                            color: 'var(--green-dark-2)' // Usando cor do tema ou similar
                                        }}
                                        title="Clique para redefinir sua senha"
                                    >
                                        Atualizar senha
                                    </span>
                                </div>
                            </div>
                        </div>

                        <PerfilCampo label="Endereço" name="endereco" valor={formData.endereco} isEditing={isEditing} onChange={handleChange} error={errors.endereco} />
                        <PerfilCampo label="Email" name="email" valor={formData.email} isEditing={isEditing} onChange={handleChange} type="email" error={errors.email} />
                        <PerfilCampo label="Telefone" name="telefone" valor={formData.telefone} isEditing={isEditing} onChange={handleChange} error={errors.telefone} />
                        <PerfilCampo label="CNPJ" name="cnpj" valor={formData.cnpj} isEditing={false} onChange={handleChange} error={errors.cnpj} disabled={true} />

                        {/* Botões */}
                        <div className="perfil-botoes">
                            {!isEditing ? (
                                <button className="btn-editar" onClick={handleEditClick}>
                                    Editar Perfil
                                </button>
                            ) : (
                                <>
                                    <button 
                                        className="btn-cancelar" 
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                    >
                                        Cancelar
                                    </button>
                                    
                                    <button 
                                        className="btn-atualizar" 
                                        onClick={handleUpdate}
                                        disabled={isLoading || Object.keys(errors).some(key => errors[key] !== "")}
                                    >
                                        {isLoading ? "Salvando..." : "Atualizar"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MeuPerfilEmpresaPage;