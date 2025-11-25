import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Estilos e Componentes
import './MeuPerfilOng.css';
import NavbarOng from '../../components/navbarOng/navbarOng';

// Assets (Fallback local)
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png'; 
import linkExterno from '../../assets/icons/linkExterno.png';

// =========================================================
// CONFIGURAÇÕES E HELPERS (AZURE)
// =========================================================

// URL DA FOTO PADRÃO (Mesma utilizada nas outras telas)
const URL_FOTO_PADRAO = "https://image2url.com/images/1763934555658-3e67f304-f96e-416b-a98f-12ef5a4fbe50.png";

const AZURE_ACCOUNT = 'mesaplustcc';
const AZURE_CONTAINER = 'fotos';
const SAS_TOKEN = 'sp=racwdl&st=2025-10-23T12:41:46Z&se=2025-12-16T13:00:00Z&sv=2024-11-04&sr=c&sig=MzeTfPe%2Bns1vJJvi%2BazLsTIPL1YDBP2z7tDTlctlfyI%3D';

const uploadParaAzure = async (file, idUsuario) => {
    const blobName = `ong_${idUsuario}_${Date.now()}_${file.name}`; 
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

// =========================================================
// MÁSCARAS E VALIDAÇÕES
// =========================================================

const maskPhone = (v) => {
    if (!v) return "";
    let n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length > 10) {
        return n.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (n.length > 6) {
        return n.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (n.length > 2) {
        return n.replace(/^(\d{2})(\d*)/, "($1) $2");
    } else {
        return n.replace(/^(\d*)/, "($1");
    }
};

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
            if (parts.length !== 2 || parts[0].length === 0 || parts[1].length < 3) {
                return "Formato de email inválido.";
            }
            const domainPart = parts[1];
            if (!domainPart.includes('.')) return "Domínio precisa de ponto.";
            const tld = domainPart.split('.').pop();
            if (tld.length < 2) return "Domínio inválido.";
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

function MeuPerfilOngPage() {
    const navigate = useNavigate();

    // --- Estados ---
    const [idOng, setIdOng] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Dados do Formulário
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        foto: null
    });
    
    // Backup e Erros
    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState({});

    // Imagens e Controle
    const [previewFoto, setPreviewFoto] = useState(userDefaultEmpresa);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fotoRemovida, setFotoRemovida] = useState(false); // NOVO ESTADO

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
                setIdOng(user.id);

                // Fetch na API - Rota de ONG
                const response = await fetch(`https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/ong/${user.id}`);
                const data = await response.json();

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
                    
                    // Se vier do banco, usa. Se não, usa a URL padrão.
                    setPreviewFoto(u.foto || URL_FOTO_PADRAO);
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

        // =========================================================
        // LIMITES DE CARACTERES
        // =========================================================

        // Limite para Nome (18 caracteres)
        if (name === 'nome' && val.length > 18) {
            val = val.slice(0, 18);
        }

        // Limite para Email (45 caracteres)
        if (name === 'email' && val.length > 45) {
            val = val.slice(0, 45);
        }

        // =========================================================
        // MÁSCARAS EXISTENTES
        // =========================================================

        if (name === 'telefone') val = maskPhone(val);
        
        setFormData(prev => ({ ...prev, [name]: val }));

        // Validação em Tempo Real
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

    const handleRemovePhoto = () => {
        // Visualmente mostra a foto padrão
        setPreviewFoto(URL_FOTO_PADRAO);
        setSelectedFile(null);
        // Marca flag para salvar a URL Padrão no banco
        setFotoRemovida(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(originalData);
        
        // Restaura foto original ou padrão se não tinha nada
        setPreviewFoto(originalData.foto || URL_FOTO_PADRAO);
        
        setSelectedFile(null);
        setFotoRemovida(false);
        setErrors({}); 
    };

    // -------------------------------------------------------
    // 3. Atualizar Perfil (PUT)
    // -------------------------------------------------------
    const handleUpdate = async () => {
        // 1. Validação Final
        const validationErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'foto') {
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
                urlParaSalvar = await uploadParaAzure(selectedFile, idOng);
            } else if (fotoRemovida) {
                // 2. Removeu (Salva URL Padrão)
                console.log("Ação: Resetando para foto padrão.");
                urlParaSalvar = URL_FOTO_PADRAO;
            } else {
                // 3. Mantém a original
                console.log("Ação: Mantendo foto atual.");
                urlParaSalvar = originalData.foto;
            }

            // Remove máscara para envio
            const telefoneLimpo = formData.telefone.replace(/\D/g, "");

            const payload = {
                nome: formData.nome,
                email: formData.email,
                telefone: telefoneLimpo,
                foto: urlParaSalvar, // Envia a URL definida acima
                senha: "" 
            };

            const res = await fetch(`https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/ong/${idOng}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (result.status) {
                alert('Perfil da ONG atualizado com sucesso!');
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

    if (loading) return <div className="loading-screen">Carregando perfil da ONG...</div>;

    return (
        <div className="page-usuario-wrapper">
            <NavbarOng />

            <main className="perfil-usuario-container">
                
                {/* === COLUNA ESQUERDA: Foto e Saudação === */}
                <section className="perfil-left-col">
                    <div className="foto-wrapper">
                        <img 
                            src={previewFoto} 
                            alt="Logo da ONG" 
                            className="foto-perfil-usuario" 
                            // Fallback para asset local se a URL quebrar
                            onError={(e) => { e.target.onerror = null; e.target.src = userDefaultEmpresa; }}
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

                            {/* Telefone */}
                            <div className="input-group full-width">
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