import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Estilos e Componentes
import './MeuPerfilUsuario.css';
import NavbarUsuario from '../../components/navbarUsuario/navbarUsuario';

// Assets
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';
import linkExterno from '../../assets/icons/linkExterno.png';

// =========================================================
// CONFIGURAÇÕES E HELPERS (Azure e Máscaras)
// =========================================================

const AZURE_ACCOUNT = 'mesaplustcc';
const AZURE_CONTAINER = 'fotos';
const SAS_TOKEN = 'sp=racwdl&st=2025-10-23T12:41:46Z&se=2025-12-16T13:00:00Z&sv=2024-11-04&sr=c&sig=MzeTfPe%2Bns1vJJvi%2BazLsTIPL1YDBP2z7tDTlctlfyI%3D';

const uploadParaAzure = async (file, idUsuario) => {
    const blobName = `user_${idUsuario}_${Date.now()}_${file.name}`;
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

const maskCPF = (v) => {
    if (!v) return "";
    return v.replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MeuPerfilUsuarioPage() {
    const navigate = useNavigate();

    // --- Estados ---
    const [idUsuario, setIdUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Dados do Formulário (Endereço removido)
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        foto: null
    });
    
    // Estado para backup dos dados (caso cancele a edição)
    const [originalData, setOriginalData] = useState({});

    // Imagens
    const [previewFoto, setPreviewFoto] = useState(userDefaultEmpresa);
    const [selectedFile, setSelectedFile] = useState(null);

    // -------------------------------------------------------
    // 1. Carregar Dados (GET)
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
                setIdUsuario(user.id);

                // Fetch na API
                const response = await fetch(`http://localhost:8080/v1/mesa-plus/usuario/${user.id}`);
                const data = await response.json();

                if (data.status && data.usuario) {
                    const u = data.usuario;
                    
                    const loadedData = {
                        nome: u.nome || '',
                        email: u.email || '',
                        cpf: maskCPF(u.cpf || ''),
                        telefone: maskPhone(u.telefone || ''),
                        foto: u.foto
                    };

                    setFormData(loadedData);
                    setOriginalData(loadedData);
                    
                    if (u.foto) setPreviewFoto(u.foto);
                }
            } catch (error) {
                console.error("Erro ao buscar usuário:", error);
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
        if (name === 'cpf') val = maskCPF(value); 
        
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewFoto(URL.createObjectURL(file));
            setSelectedFile(file);
        }
    };

    // --- NOVO HANDLER: REMOVER FOTO ---
    const handleRemovePhoto = () => {
        // 1. Define a visualização como a imagem padrão
        setPreviewFoto(userDefaultEmpresa);
        
        // 2. Limpa qualquer arquivo que tenha sido selecionado no input
        setSelectedFile(null);
        
        // 3. Atualiza o formData para null (sinaliza para a API remover a foto)
        setFormData(prev => ({ ...prev, foto: null })); 
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(originalData);
        setPreviewFoto(originalData.foto || userDefaultEmpresa);
        setSelectedFile(null);
    };

    // -------------------------------------------------------
    // 3. Atualizar Perfil (PUT)
    // -------------------------------------------------------
    const handleUpdate = async () => {
        if (!formData.nome || !formData.email) {
            alert("Nome e Email são obrigatórios.");
            return;
        }

        setSaving(true);
        try {
            let finalFotoUrl = formData.foto;

            // Se houver um arquivo selecionado, faz upload e pega a nova URL
            if (selectedFile) {
                finalFotoUrl = await uploadParaAzure(selectedFile, idUsuario);
            }
            // Se não houver arquivo selecionado e formData.foto for null (via handleRemovePhoto),
            // finalFotoUrl continuará null, enviando essa info para o backend.

            const payload = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                // Endereço removido do payload
                foto: finalFotoUrl,
                senha: "" 
            };

            const res = await fetch(`http://localhost:8080/v1/mesa-plus/usuario/${idUsuario}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (result.status) {
                alert('Perfil atualizado com sucesso!');
                setIsEditing(false);
                
                const novosDados = { ...formData, foto: finalFotoUrl };
                setOriginalData(novosDados);
                setFormData(novosDados);

                // Atualiza localStorage
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

    if (loading) return <div className="loading-screen">Carregando perfil...</div>;

    return (
        <div className="page-usuario-wrapper">
            <NavbarUsuario />

            <main className="perfil-usuario-container">
                
                {/* === COLUNA ESQUERDA: Foto e Saudação === */}
                <section className="perfil-left-col">
                    <div className="foto-wrapper">
                        <img 
                            src={previewFoto || userDefaultEmpresa} 
                            alt="Foto de Perfil" 
                            className="foto-perfil-usuario" 
                        />
                        
                        {/* Botões de Edição da Foto (Alterar e Remover) */}
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
                            {formData.nome ? formData.nome.split(' ')[0] : 'Usuário'}
                        </h2> 
                    </div>

                    <div className="card-dados-usuario">
                        <h3 className="card-titulo">Dados da conta:</h3>

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

                            {/* CPF - NÃO EDITÁVEL */}
                            <div className="input-group">
                                <label>CPF:</label>
                                <span className="data-text">{formData.cpf}</span>
                            </div>

                            {/* Telefone */}
                            <div className="input-group">
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

                            {/* CAMPO ENDEREÇO FOI REMOVIDO AQUI */}

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
                                        {saving ? 'Salvando...' : 'atualizar'}
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

export default MeuPerfilUsuarioPage;