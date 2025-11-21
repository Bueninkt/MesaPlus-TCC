import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Estilos e Componentes
import './MeuPerfilOng.css';
import NavbarOng from '../../components/navbarOng/navbarOng';

// Assets
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png'; // Pode manter ou trocar por um ícone de ONG se tiver
import linkExterno from '../../assets/icons/linkExterno.png';

// =========================================================
// CONFIGURAÇÕES E HELPERS (Azure e Máscaras)
// =========================================================

const AZURE_ACCOUNT = 'mesaplustcc';
const AZURE_CONTAINER = 'fotos';
const SAS_TOKEN = 'sp=racwdl&st=2025-10-23T12:41:46Z&se=2025-12-16T13:00:00Z&sv=2024-11-04&sr=c&sig=MzeTfPe%2Bns1vJJvi%2BazLsTIPL1YDBP2z7tDTlctlfyI%3D';

const uploadParaAzure = async (file, idUsuario) => {
    const blobName = `ong_${idUsuario}_${Date.now()}_${file.name}`; // Alterado prefixo para ong_
    const url = `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}?${SAS_TOKEN}`;

    const res = await fetch(url, {
        method: 'PUT',
        headers: { 
            'x-ms-blob-type': 'BlockBlob', 
            'Content-Type': file.type 
        },
        body: file
    });

    if (!res.ok) throw new Error(`Azure status ${res.status}`);
    return `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}`;
};

// --- Máscaras ---
const maskPhone = (v) => {
    if (!v) return "";
    let n = v.replace(/\D/g, "").slice(0, 11);
    return n.length > 10
        ? n.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        : n.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
};

// (Removed maskCPF function as it is not needed for ONG based on provided SQL)

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MeuPerfilOngPage() {
    const navigate = useNavigate();

    // --- Estados ---
    const [idOng, setIdOng] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Dados do Formulário (Removido CPF e Endereço para alinhar com tbl_ongs e procedure)
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        foto: null
    });
    
    // Estado para backup dos dados (caso cancele a edição)
    const [originalData, setOriginalData] = useState({});

    // Imagens
    const [previewFoto, setPreviewFoto] = useState(userDefaultEmpresa);
    const [selectedFile, setSelectedFile] = useState(null);

    // -------------------------------------------------------
    // 1. Carregar Dados (GET) - Endpoint de ONG
    // -------------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userStorage = localStorage.getItem("user");
                if (!userStorage) {
                    navigate("/login");
                    return;
                }
                const user = JSON.parse(userStorage);
                setIdOng(user.id);

                // Fetch na API - Rota de ONG
                // Endpoint ajustado conforme solicitado
                const response = await fetch(`http://localhost:8080/v1/mesa-plus/ong/${user.id}`);
                const data = await response.json();

                // Verifica se data.ong existe (baseado no Controller da ONG)
                if (data.status && data.ong) {
                    const u = data.ong;
                    
                    const loadedData = {
                        nome: u.nome || '',
                        email: u.email || '',
                        telefone: maskPhone(u.telefone || ''),
                        foto: u.foto
                    };

                    setFormData(loadedData);
                    setOriginalData(loadedData);
                    
                    if (u.foto) setPreviewFoto(u.foto);
                }
            } catch (error) {
                console.error("Erro ao buscar ONG:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    // -------------------------------------------------------
    // 2. Handlers (Inputs e Imagem)
    // -------------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = value;

        if (name === 'telefone') val = maskPhone(value);
        
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewFoto(URL.createObjectURL(file));
            setSelectedFile(file);
        }
    };

    const handleRemovePhoto = () => {
        setPreviewFoto(userDefaultEmpresa);
        setSelectedFile(null);
        setFormData(prev => ({ ...prev, foto: null })); 
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(originalData);
        setPreviewFoto(originalData.foto || userDefaultEmpresa);
        setSelectedFile(null);
    };

    // -------------------------------------------------------
    // 3. Atualizar Perfil (PUT) - Endpoint de ONG
    // -------------------------------------------------------
    const handleUpdate = async () => {
        if (!formData.nome || !formData.email) {
            alert("Nome e Email são obrigatórios.");
            return;
        }

        setSaving(true);
        try {
            let finalFotoUrl = formData.foto;

            if (selectedFile) {
                finalFotoUrl = await uploadParaAzure(selectedFile, idOng);
            }

            // Payload alinhado com a procedure atualizar_ong (sem cpf, sem endereco)
            const payload = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                foto: finalFotoUrl,
                senha: "" // A controller/DAO tratam senha vazia mantendo a antiga
            };

            // Endpoint ajustado para ONG
            const res = await fetch(`http://localhost:8080/v1/mesa-plus/ong/${idOng}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (result.status) {
                alert('Perfil da ONG atualizado com sucesso!');
                setIsEditing(false);
                
                const novosDados = { ...formData, foto: finalFotoUrl };
                setOriginalData(novosDados);
                setFormData(novosDados);

                // Atualiza localStorage mantendo outras props (como tipo de usuario)
                const userStorage = JSON.parse(localStorage.getItem("user"));
                localStorage.setItem("user", JSON.stringify({ ...userStorage, ...payload }));
            } else {
                alert('Erro ao atualizar: ' + (result.message || 'Erro desconhecido'));
            }

        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao atualizar.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-screen">Carregando perfil da ONG...</div>;

    return (
        <div className="page-usuario-wrapper">
            <NavbarOng />

            <main className="perfil-usuario-container">
                
                {/* === COLUNA ESQUERDA: Foto e Saudação === */}
                <section className="perfil-left-col">
                    <div className="foto-wrapper">
                        <img 
                            src={previewFoto || userDefaultEmpresa} 
                            alt="Logo da ONG" 
                            className="foto-perfil-usuario" 
                        />
                        
                        {isEditing && (
                            <div className="botoes-foto-wrapper">
                                <label htmlFor="foto-upload" className="btn-editar-foto">
                                    Alterar
                                </label>
                                
                                <button 
                                    type="button" 
                                    onClick={handleRemovePhoto} 
                                    className="btn-remover-foto"
                                >
                                    Remover
                                </button>
                                
                                <input 
                                    id="foto-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                    hidden 
                                />
                            </div>
                        )}
                    </div>
                </section>

                {/* === COLUNA DIREITA: Card de Dados === */}
                <section className="perfil-right-col">
                    
                    <div className="saudacao-container">
                        <h1 className="titulo-ola">Olá</h1>
                        <h2 className="nome-destaque">
                            {formData.nome ? formData.nome.split(' ')[0] : 'ONG'}
                        </h2> 
                    </div>

                    <div className="card-dados-usuario">
                        <h3 className="card-titulo">Dados de contato:</h3>

                        <div className="form-grid">
                            {/* Nome */}
                            <div className="input-group full-width">
                                <label>Nome:</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="nome" 
                                        value={formData.nome} 
                                        onChange={handleChange} 
                                        className="input-editable"
                                    />
                                ) : (
                                    <span className="data-text">{formData.nome}</span>
                                )}
                            </div>

                            {/* Email */}
                            <div className="input-group full-width">
                                <label>Email:</label>
                                {isEditing ? (
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange}
                                        className="input-editable"
                                    />
                                ) : (
                                    <span className="data-text">{formData.email}</span>
                                )}
                            </div>

                            {/* Telefone */}
                            <div className="input-group full-width">
                                <label>Telefone:</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="telefone" 
                                        value={formData.telefone} 
                                        onChange={handleChange}
                                        maxLength={15}
                                        className="input-editable"
                                    />
                                ) : (
                                    <span className="data-text">{formData.telefone}</span>
                                )}
                            </div>
                            
                            {/* Endereço e CPF foram removidos pois não são atualizáveis via /ong PUT */}
                        </div>

                        {/* Botões de Ação */}
                        <div className="card-actions">
                            {!isEditing ? (
                                <button 
                                    className="btn-editar-perfil" 
                                    onClick={() => setIsEditing(true)}
                                >
                                    Editar Perfil
                                </button>
                            ) : (
                                <div className="btns-edicao">
                                    <button 
                                        className="btn-cancelar" 
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="btn-atualizar" 
                                        onClick={handleUpdate}
                                        disabled={saving}
                                    >
                                        {saving ? 'Salvando...' : 'Atualizar'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card de Atualizar Senha */}
                    <div className="card-senha" onClick={() => navigate('/recuperarNovaSenha')}>
                        <span>Atualizar Senha</span>
                        <img src={linkExterno} alt="Ir" className="icon-link" />
                    </div>

                </section>
            </main>
        </div>
    );
}

export default MeuPerfilOngPage;