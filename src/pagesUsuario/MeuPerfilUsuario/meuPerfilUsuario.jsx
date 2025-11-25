import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Estilos e Componentes
import './MeuPerfilUsuario.css';
import NavbarUsuario from '../../components/navbarUsuario/navbarUsuario';

// Assets (Fallback local)
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';
import linkExterno from '../../assets/icons/linkExterno.png';

// =========================================================
// CONFIGURAÇÕES E HELPERS (Azure e Máscaras)
// =========================================================

// URL DA FOTO PADRÃO (Igual ao sistema da empresa)
const URL_FOTO_PADRAO = "https://image2url.com/images/1763934555658-3e67f304-f96e-416b-a98f-12ef5a4fbe50.png";

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
// LÓGICA DE VALIDAÇÃO
// =========================================================
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
            if (emailRegex.test(value)) return "";

            if (!value.includes("@")) return "Email deve conter um '@'.";
            const parts = value.split('@');
            if (parts.length !== 2 || parts[0].length === 0 || parts[1].length < 3) return "Formato de email inválido.";
            const domainPart = parts[1];
            if (!domainPart.includes('.')) return "O domínio precisa de um ponto.";
            const tld = domainPart.split('.').pop();
            if (tld.length < 2) return "Final do domínio inválido.";
            return "Formato de email inválido.";

        case "telefone":
            const phoneDigits = value.replace(/\D/g, "");
            if (phoneDigits.length < 10) return "Telefone deve ter 10 ou 11 dígitos.";
            return "";

        default:
            return "";
    }
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MeuPerfilUsuarioPage() {
    const navigate = useNavigate();

    const [idUsuario, setIdUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Estado principal dos campos de texto
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cpf: '',
        telefone: '',
        foto: null 
    });
    
    // Dados originais para o "Cancelar"
    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState({});

    // --- Controle de Imagem ---
    const [previewFoto, setPreviewFoto] = useState(userDefaultEmpresa);
    const [selectedFile, setSelectedFile] = useState(null);
    // Flag para saber se o usuário clicou em "Remover"
    const [fotoRemovida, setFotoRemovida] = useState(false);

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

                const response = await fetch(`http://localhost:8080/v1/mesa-plus/usuario/${user.id}`);
                const data = await response.json();

                if (data.status && data.usuario) {
                    const u = data.usuario;
                    
                    const loadedData = {
                        nome: u.nome || '',
                        email: u.email || '',
                        cpf: maskCPF(u.cpf || ''),
                        telefone: maskPhone(u.telefone || ''),
                        foto: u.foto // URL que veio do banco
                    };

                    setFormData(loadedData);
                    setOriginalData(loadedData);
                    
                    // Se vier do banco, usa. Se não, usa a URL padrão.
                    setPreviewFoto(u.foto || URL_FOTO_PADRAO);
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
    // 2. Handlers
    // -------------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = value;

        // =========================================================
        // LIMITES DE CARACTERES
        // =========================================================
        
        // Limite para Nome (18 caracteres)
        if (name === 'nome' && val.length > 50) {
            val = val.slice(0, 50);
        }

        // Limite para Email (45 caracteres)
        if (name === 'email' && val.length > 45) {
            val = val.slice(0, 45);
        }

        // =========================================================
        // MÁSCARAS EXISTENTES
        // =========================================================
        
        if (name === 'telefone') val = maskPhone(val);
        
        // Atualiza o estado
        setFormData(prev => ({ ...prev, [name]: val }));

        // Validação em tempo real
        const errorMessage = validateField(name, val);
        setErrors(prev => ({ ...prev, [name]: errorMessage }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewFoto(URL.createObjectURL(file));
            setSelectedFile(file);
            setFotoRemovida(false); // Selecionou nova, desmarca remoção
        }
    };

    // Lógica igual a da Empresa: Seta a visualização para a URL padrão e marca a flag
    const handleRemovePhoto = () => {
        setPreviewFoto(URL_FOTO_PADRAO);
        setSelectedFile(null);
        setFotoRemovida(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(originalData);
        
        // Restaura a foto original ou a padrão se não tinha nada
        setPreviewFoto(originalData.foto || URL_FOTO_PADRAO);
        
        setSelectedFile(null);
        setFotoRemovida(false);
        setErrors({});
    };

    // -------------------------------------------------------
    // 3. Atualizar Perfil (PUT)
    // -------------------------------------------------------
    const handleUpdate = async () => {
        // Validação
        const validationErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'foto' && key !== 'senha' && key !== 'cpf') {
                const error = validateField(key, formData[key]);
                if (error) validationErrors[key] = error;
            }
        });

        setErrors(validationErrors);
        if (Object.values(validationErrors).some(error => error)) {
            alert("Por favor, corrija os campos inválidos antes de salvar.");
            return;
        }

        setSaving(true);

        try {
            let urlParaSalvar;

            // --- LÓGICA DE PRIORIDADE DA FOTO ---
            if (selectedFile) {
                // 1. Upload novo
                console.log("Ação: Upload de nova foto.");
                urlParaSalvar = await uploadParaAzure(selectedFile, idUsuario);
            } else if (fotoRemovida) {
                // 2. Removeu (Salva URL Padrão)
                console.log("Ação: Resetando para foto padrão.");
                urlParaSalvar = URL_FOTO_PADRAO;
            } else {
                // 3. Mantém a original
                console.log("Ação: Mantendo foto atual.");
                urlParaSalvar = originalData.foto;
            }

            const telefoneLimpo = formData.telefone.replace(/\D/g, "");

            const payload = {
                nome: formData.nome,
                email: formData.email,
                telefone: telefoneLimpo,
                foto: urlParaSalvar, // Envia a URL definida acima
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
                
                // Atualiza estados locais
                const novosDados = { ...formData, foto: urlParaSalvar };
                setOriginalData(novosDados);
                setFormData(novosDados);
                setPreviewFoto(urlParaSalvar);

                // Limpa flags
                setSelectedFile(null);
                setFotoRemovida(false);

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
                
                <section className="perfil-left-col">
                    <div className="foto-wrapper">
                        <img 
                            src={previewFoto} 
                            alt="Foto de Perfil" 
                            className="foto-perfil-usuario" 
                            // Fallback caso a URL quebre
                            onError={(e) => { e.target.onerror = null; e.target.src = userDefaultEmpresa; }}
                        />
                        
                        {isEditing && (
                            <div className="botoes-foto-wrapper">
                                <label htmlFor="foto-upload" className="btn-editar-foto">
                                    Alterar
                                </label>
                                <button type="button" onClick={handleRemovePhoto} className="btn-remover-foto">
                                    Remover
                                </button>
                                <input id="foto-upload" type="file" accept="image/*" onChange={handleImageChange} hidden />
                            </div>
                        )}
                    </div>
                </section>

                <section className="perfil-right-col">
                    <div className="saudacao-container">
                        <h1 className="titulo-ola">Olá</h1>
                        <h2 className="nome-destaque">
                            {formData.nome ? formData.nome.split(' ')[0] : 'usuário'}
                        </h2> 
                    </div>

                    <div className="card-dados-usuario">
                        <h3 className="card-titulo">Dados da conta:</h3>

                        <div className="form-grid">
                            {/* Nome */}
                            <div className="input-group full-width">
                                <label>Nome:</label>
                                {isEditing ? (
                                    <>
                                        <input 
                                            type="text" 
                                            name="nome" 
                                            value={formData.nome} 
                                            onChange={handleChange} 
                                            className={`input-editable ${errors.nome ? 'input-error' : ''}`}
                                        />
                                        {errors.nome && <span style={{color: 'red', fontSize: '0.8rem', display: 'block', marginTop: '4px'}}>{errors.nome}</span>}
                                    </>
                                ) : (
                                    <span className="data-text">{formData.nome}</span>
                                )}
                            </div>

                            {/* Email */}
                            <div className="input-group full-width">
                                <label>Email:</label>
                                {isEditing ? (
                                    <>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleChange}
                                            className={`input-editable ${errors.email ? 'input-error' : ''}`}
                                        />
                                        {errors.email && <span style={{color: 'red', fontSize: '0.8rem', display: 'block', marginTop: '4px'}}>{errors.email}</span>}
                                    </>
                                ) : (
                                    <span className="data-text">{formData.email}</span>
                                )}
                            </div>

                            {/* CPF - SEMPRE TEXTO (NÃO EDITÁVEL) */}
                            <div className="input-group">
                                <label>CPF:</label>
                                <span className="data-text" style={{ color: isEditing ? '#000000ff' : '#000' }}>
                                    {formData.cpf}
                                </span>
                            </div>

                            {/* Telefone */}
                            <div className="input-group">
                                <label>Telefone:</label>
                                {isEditing ? (
                                    <>
                                        <input 
                                            type="text" 
                                            name="telefone" 
                                            value={formData.telefone} 
                                            onChange={handleChange}
                                            maxLength={15}
                                            className={`input-editable ${errors.telefone ? 'input-error' : ''}`}
                                        />
                                        {errors.telefone && <span style={{color: 'red', fontSize: '0.8rem', display: 'block', marginTop: '4px'}}>{errors.telefone}</span>}
                                    </>
                                ) : (
                                    <span className="data-text">{formData.telefone}</span>
                                )}
                            </div>
                        </div>

                        <div className="card-actions">
                            {!isEditing ? (
                                <button className="btn-editar-perfil" onClick={() => setIsEditing(true)}>
                                    Editar Perfil
                                </button>
                            ) : (
                                <div className="btns-edicao">
                                    <button className="btn-cancelar" onClick={handleCancel} disabled={saving}>
                                        Cancelar
                                    </button>
                                    <button className="btn-atualizar" onClick={handleUpdate} disabled={saving}>
                                        {saving ? 'Salvando...' : 'Atualizar'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

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