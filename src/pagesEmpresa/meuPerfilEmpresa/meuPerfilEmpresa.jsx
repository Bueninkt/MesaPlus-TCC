import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes e Estilos
import './MeuPerfilEmpresa.css';
import NavbarEmpresa from '../../components/navbarEmpresa/navbarEmpresa';
import AlimentoCard from '../../components/AlimentoCard/AlimentoCard';
import Paginacao from '../../components/PaginacaoCard/Paginacao';
import ModalAlimento from '../../components/ModalAlimento/ModalAlimento';

// Assets (Mantemos o local para fallback caso a URL falhe, ou pode usar a URL direto)
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';

// =========================================================
// CONFIGURAÇÕES
// =========================================================

// URL DA FOTO PADRÃO QUE SERÁ SALVA NO BANCO AO REMOVER
const URL_FOTO_PADRAO = "https://image2url.com/images/1763934555658-3e67f304-f96e-416b-a98f-12ef5a4fbe50.png";

// AZURE CONFIG
const AZURE_ACCOUNT = 'mesaplustcc';
const AZURE_CONTAINER = 'fotos';
const SAS_TOKEN = 'sp=racwdl&st=2025-10-23T12:41:46Z&se=2025-12-16T13:00:00Z&sv=2024-11-04&sr=c&sig=MzeTfPe%2Bns1vJJvi%2BazLsTIPL1YDBP2z7tDTlctlfyI%3D';

const uploadParaAzure = async (file, idEmpresa) => {
    const blobName = `${idEmpresa}_${Date.now()}_${file.name}`;
    const url = `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}?${SAS_TOKEN}`;

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': file.type
        },
        body: file
    });

    if (!res.ok) throw new Error(`Azure retornou status ${res.status}`);

    return `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}`;
};

// =========================================================
// MÁSCARAS E VALIDAÇÕES
// =========================================================

const maskPhone = (v) => {
    if (!v) return "";
    let n = v.replace(/\D/g, "").slice(0, 11);
    return n.length > 10
        ? n.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        : n.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
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
            return "Formato de email inválido.";
        case "telefone":
            const phoneDigits = value.replace(/\D/g, "");
            if (phoneDigits.length < 10) return "Telefone deve ter 10 ou 11 dígitos.";
            return "";
        case "endereco":
            if (!value || value.trim() === "") return "Endereço é obrigatório.";
            if (value.length > 150) return "O endereço deve ter no máximo 150 caracteres.";
            return "";
        default:
            return "";
    }
};

// =========================================================
// SUB-COMPONENTE: CAMPO DE PERFIL
// =========================================================

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
                            size={valor && valor.length > 36 ? valor.length : 36}
                        />
                    ) : (
                        isEditing && disabled ? (
                            <input
                                type="text"
                                value={valor}
                                disabled
                                className="campo-input input-disabled"
                                size={valor && valor.length > 36 ? valor.length : 36}
                            />
                        ) : (
                            <span className="campo-texto">{valor}</span>
                        )
                    )}
                </div>
            </div>
            {error && <span className="campo-erro" style={{ color: 'red', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{error}</span>}
        </div>
    );
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MeuPerfilEmpresaPage() {
    const navigate = useNavigate();

    // --- Estados do Perfil ---
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        telefone: "",
        cnpj: "",
        endereco: ""
    });
    const [originalData, setOriginalData] = useState({});
    const [originalPasswordHash, setOriginalPasswordHash] = useState("");
    const [idEmpresa, setIdEmpresa] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Inicia com a imagem padrão local ou vazia
    const [profileImage, setProfileImage] = useState(userDefaultEmpresa);
    const [errors, setErrors] = useState({});
    
    // --- Estados de Controle de Imagem ---
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // --- NOVO ESTADO: Controle de Remoção/Reset ---
    const [fotoRemovida, setFotoRemovida] = useState(false);
    
    // --- Estados para Alimentos ---
    const [meusAlimentos, setMeusAlimentos] = useState([]);
    const [loadingAlimentos, setLoadingAlimentos] = useState(false);
    const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);

    // --- Estados da Paginação ---
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 2;

    // -------------------------------------------------------
    // EFEITOS (USE EFFECT) - CARREGAMENTO
    // -------------------------------------------------------

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
                        endereco: emp.endereco || ""
                    };

                    setFormData(initialData);
                    setOriginalData({ ...initialData, fotoUrl: emp.foto });
                    setOriginalPasswordHash(emp.senha);

                    // Se vier do banco, usa. Se não, usa a URL padrão fornecida ou o asset local
                    // Se emp.foto for null, vamos mostrar o userDefaultEmpresa (asset local) na tela
                    setProfileImage(emp.foto || URL_FOTO_PADRAO);
                }
            } catch (error) {
                console.error("Erro de conexão:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmpresaData();
    }, [navigate]);

    useEffect(() => {
        const fetchAlimentos = async () => {
            if (!idEmpresa) return;
            try {
                setLoadingAlimentos(true);
                const response = await fetch(`http://localhost:8080/v1/mesa-plus/empresaAlimento/${idEmpresa}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status && data.resultFiltro) {
                        setMeusAlimentos(data.resultFiltro);
                    } else {
                        setMeusAlimentos([]);
                    }
                } else {
                    setMeusAlimentos([]);
                }
            } catch (error) {
                console.error("Erro ao buscar alimentos:", error);
            } finally {
                setLoadingAlimentos(false);
            }
        };
        fetchAlimentos();
    }, [idEmpresa]);

    // -------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------
    const totalPages = Math.ceil(meusAlimentos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentAlimentos = meusAlimentos.slice(startIndex, endIndex);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
            setSelectedFile(file);
            setFotoRemovida(false); // Se selecionou nova, desmarca a remoção
            setErrors(prev => ({ ...prev, imagem: "" }));
        }
    };

    // --- LÓGICA DE REMOVER FOTO (VISUAL) ---
    const handleRemovePhoto = () => {
        // 1. Muda visualmente para a URL Padrão fornecida
        setProfileImage(URL_FOTO_PADRAO);
        
        // 2. Limpa qualquer arquivo que estivesse selecionado para upload
        setSelectedFile(null);
        
        // 3. Marca a flag para sabermos que deve enviar a URL Padrão no Update
        setFotoRemovida(true);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        let maskedValue = value;

        if (name === "telefone") maskedValue = maskPhone(value);
        else if (name === "cnpj") maskedValue = maskCNPJ(value);

        setFormData(prevData => ({ ...prevData, [name]: maskedValue }));
        setErrors(prevErrors => ({ ...prevErrors, [name]: validateField(name, maskedValue) }));
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setErrors({});
        setSelectedFile(null);
    };

    const handleCancel = () => {
        setFormData({
            nome: originalData.nome,
            email: originalData.email,
            senha: originalData.senha,
            telefone: originalData.telefone,
            cnpj: originalData.cnpj,
            endereco: originalData.endereco
        });
        
        // Restaura a foto que estava antes de começar a editar
        setProfileImage(originalData.fotoUrl || URL_FOTO_PADRAO);
        setSelectedFile(null);
        setFotoRemovida(false);
        setErrors({});
        setIsEditing(false);
    };

    // --- LÓGICA DE UPDATE (ENVIO AO BANCO) ---
    const handleUpdate = async () => {
        const validationErrors = {};
        Object.keys(formData).forEach(name => {
            if (name !== 'senha') {
                const error = validateField(name, formData[name]);
                if (error) validationErrors[name] = error;
            }
        });

        setErrors(validationErrors);

        if (Object.values(validationErrors).some(error => error)) {
            alert("Por favor, corrija os erros antes de salvar.");
            return;
        }

        try {
            setIsLoading(true);

            let urlParaSalvar;

            // --- LÓGICA DE PRIORIDADE DA FOTO ---
            if (selectedFile) {
                // 1. Prioridade Máxima: Tem arquivo novo selecionado -> Upload Azure
                console.log("Ação: Upload de nova foto.");
                urlParaSalvar = await uploadParaAzure(selectedFile, idEmpresa);

            } else if (fotoRemovida) {
                // 2. Prioridade Média: Usuário clicou em "Remover" -> Salva a URL PADRÃO
                console.log("Ação: Resetando para foto padrão (URL fixa).");
                urlParaSalvar = URL_FOTO_PADRAO;

            } else {
                // 3. Prioridade Baixa: Não mexeu na foto -> Mantém o que já estava
                console.log("Ação: Mantendo foto atual.");
                urlParaSalvar = originalData.fotoUrl;
            }

            // Limpeza dos dados de texto
            const telefoneLimpo = formData.telefone.replace(/\D/g, "");
            const enderecoLimpo = formData.endereco ? formData.endereco.trim() : null;

            // Monta o objeto final para o PUT
            const dadosParaEnviar = {
                nome: formData.nome,
                email: formData.email,
                telefone: telefoneLimpo,
                endereco: enderecoLimpo,
                foto: urlParaSalvar // Envia a URL (Azure, Padrão ou Antiga)
            };

            if (formData.senha !== originalPasswordHash) {
                dadosParaEnviar.senha = formData.senha;
            }

            // Envia para a API
            const response = await fetch(`http://localhost:8080/v1/mesa-plus/empresa/${idEmpresa}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaEnviar)
            });

            if (!response.ok) throw new Error(await response.text());

            const result = await response.json();

            if (result.status) {
                alert("Perfil atualizado com sucesso!");
                setIsEditing(false);
                
                // Atualiza os dados originais
                setOriginalData({ ...formData, fotoUrl: urlParaSalvar });
                setProfileImage(urlParaSalvar);
                
                // Reseta estados temporários
                setSelectedFile(null);
                setFotoRemovida(false);

                // Atualiza localStorage
                const userStorage = JSON.parse(localStorage.getItem("user"));
                if (userStorage) {
                    localStorage.setItem("user", JSON.stringify({ ...userStorage, foto: urlParaSalvar }));
                }

            } else {
                alert("Erro: " + result.message);
            }
        } catch (error) {
            console.error("Erro update:", error);
            alert("Falha ao atualizar.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardClick = (alimento) => setAlimentoSelecionado(alimento);
    const handleCloseModal = () => setAlimentoSelecionado(null);

    if (isLoading && !formData.nome) {
        return <div className="perfil-pagina-container"><p>Carregando perfil...</p></div>;
    }

    return (
        <>
            <NavbarEmpresa />

            <div className="perfil-pagina-container">
                <div className="perfil-card">
                    {/* FOTO */}
                    <div className="perfil-foto-container">
                        <div className="foto-wrapper-empresa">
                            <img
                                src={profileImage || URL_FOTO_PADRAO}
                                alt="Foto Empresa"
                                className="perfil-imagem"
                                // Fallback caso a URL padrão quebre, usa a local
                                onError={(e) => { e.target.onerror = null; e.target.src = userDefaultEmpresa; }}
                            />
                            {isEditing && (
                                <div className="botoes-foto-wrapper-empresa">
                                    <label htmlFor="file-upload" className="btn-editar-foto-empresa">
                                        {isLoading ? "..." : "Alterar"}
                                    </label>

                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="btn-remover-foto-empresa"
                                        disabled={isLoading}
                                    >
                                        Remover
                                    </button>

                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="file-input-hidden"
                                        disabled={isLoading}
                                    />
                                </div>
                            )}
                        </div>
                        {errors.imagem && <span className="campo-erro-foto">{errors.imagem}</span>}
                    </div>

                    {/* DADOS */}
                    <div className="perfil-dados-container">
                        <PerfilCampo
                            label="Nome"
                            name="nome"
                            valor={formData.nome}
                            isEditing={isEditing}
                            onChange={handleChange}
                            error={errors.nome}
                        />

                        <div className="campo-container">
                            <label className="campo-label">Senha:</label>
                            <div className="campo-valor-wrapper">
                                <div className="campo-scroll-container">
                                    <span
                                        className="campo-texto"
                                        onClick={() => navigate('/recuperarNovaSenha')}
                                        style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '500', color: 'var(--green-dark-2)' }}
                                    >
                                        Atualizar senha
                                    </span>
                                </div>
                            </div>
                        </div>

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
                            isEditing={false}
                            onChange={handleChange}
                            error={errors.cnpj}
                            disabled={true}
                        />

                        {/* Botões de Ação */}
                        <div className="perfil-botoes">
                            {!isEditing ? (
                                <button className="btn-editar" onClick={handleEditClick}>
                                    Editar Perfil
                                </button>
                            ) : (
                                <>
                                    <button className="btn-cancelar" onClick={handleCancel} disabled={isLoading}>
                                        Cancelar
                                    </button>
                                    <button
                                        className="btn-atualizar"
                                        onClick={handleUpdate}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Salvando..." : "Atualizar"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* SEÇÃO MEUS ALIMENTOS */}
                <div className="meus-alimentos-wrapper-empresa">
                    <h2 className="titulo-secao">Meus Alimentos Cadastrados</h2>
                    <div className="linha-divisoria"></div>

                    {loadingAlimentos ? (
                        <p className="loading-msg">Carregando seus alimentos...</p>
                    ) : (
                        <div className="alimentos-grid">
                            {currentAlimentos.length > 0 ? (
                                currentAlimentos.map((item) => (
                                    <AlimentoCard
                                        key={item.id_alimento || item.id}
                                        alimento={item}
                                        onCardClick={handleCardClick}
                                        onDeleteClick={null}
                                    />
                                ))
                            ) : (
                                <div className="sem-alimentos-msg">
                                    <p>Você ainda não cadastrou nenhum alimento.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER PAGINAÇÃO */}
                {meusAlimentos && meusAlimentos.length > ITEMS_PER_PAGE && (
                    <footer className="paginacao-footer-perfil-empresa">
                        <Paginacao
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </footer>
                )}
            </div>

            {alimentoSelecionado && (
                <ModalAlimento
                    alimento={{
                        ...alimentoSelecionado,
                        id: alimentoSelecionado.id || alimentoSelecionado.id_alimento
                    }}
                    onClose={handleCloseModal}
                    isPedidoPage={true}
                />
            )}
        </>
    );
}

export default MeuPerfilEmpresaPage;