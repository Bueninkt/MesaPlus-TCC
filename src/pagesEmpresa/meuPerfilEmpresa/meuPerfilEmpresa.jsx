import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes e Estilos
import './MeuPerfilEmpresa.css';
import NavbarEmpresa from '../../components/navbarEmpresa/navbarEmpresa';
import AlimentoCard from '../../components/AlimentoCard/AlimentoCard';
import Paginacao from '../../components/PaginacaoCard/Paginacao';
// 1. Importação do Modal (Verifique se o caminho está correto no seu projeto)
import ModalAlimento from '../../components/ModalAlimento/ModalAlimento';

// Assets
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';

// =========================================================
// CONFIGURAÇÕES E HELPERS
// =========================================================

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

// --- Máscaras e Validações ---

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
    if (name === "nome" && !value) return "Nome obrigatório";
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email inválido";
    return "";
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
    const [profileImage, setProfileImage] = useState(userDefaultEmpresa);
    const [errors, setErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- Estados para Alimentos ---
    const [meusAlimentos, setMeusAlimentos] = useState([]);
    const [loadingAlimentos, setLoadingAlimentos] = useState(false);

    // 2. Estado para controlar o Modal
    const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);

    // --- Estados da Paginação ---
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 2;

    // -------------------------------------------------------
    // EFEITOS (USE EFFECT)
    // -------------------------------------------------------

    // 1. Carregar dados da Empresa
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
                    setOriginalData({ ...initialData, fotoUrl: emp.foto });
                    setOriginalPasswordHash(emp.senha);

                    if (emp.foto) setProfileImage(emp.foto);
                }
            } catch (error) {
                console.error("Erro de conexão:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmpresaData();
    }, [navigate]);

    // 2. Buscar Alimentos
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
    // LÓGICA DE PAGINAÇÃO
    // -------------------------------------------------------
    const totalPages = Math.ceil(meusAlimentos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentAlimentos = meusAlimentos.slice(startIndex, endIndex);

    // -------------------------------------------------------
    // HANDLERS (FUNÇÕES DE AÇÃO)
    // -------------------------------------------------------

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
        setProfileImage(originalData.fotoUrl || userDefaultEmpresa);
        setSelectedFile(null);
        setErrors({});
        setIsEditing(false);
    };

    const handleUpdate = async () => {
        const validationErrors = {};

        Object.keys(formData).forEach(name => {
            if (name !== 'endereco' && name !== 'cnpj' && name !== 'senha') {
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

            if (formData.senha !== originalPasswordHash) {
                dadosParaEnviar.senha = formData.senha;
            }

            const response = await fetch(`http://localhost:8080/v1/mesa-plus/empresa/${idEmpresa}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaEnviar)
            });

            if (!response.ok) throw new Error(await response.text());

            const result = await response.json();

            if (result.status) {
                alert("Perfil atualizado!");
                setIsEditing(false);
                setSelectedFile(null);
                setOriginalData({ ...formData, fotoUrl: finalImageUrl });
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

    // 3. Lógica para abrir o Modal
    const handleCardClick = (alimento) => {
        console.log("Abrindo modal para:", alimento);
        setAlimentoSelecionado(alimento);
    };

    // 4. Lógica para fechar o Modal
    const handleCloseModal = () => {
        setAlimentoSelecionado(null);
    };

    // -------------------------------------------------------
    // RENDERIZAÇÃO (JSX)
    // -------------------------------------------------------

    if (isLoading && !formData.nome) {
        return <div className="perfil-pagina-container"><p>Carregando perfil...</p></div>;
    }

    return (
        <>
            <NavbarEmpresa />

            <div className="perfil-pagina-container">

                {/* === CARD DE PERFIL === */}
                <div className="perfil-card">

                    {/* Foto */}
                    <div className="perfil-foto-container">
                        <img src={profileImage || userDefaultEmpresa} alt="Foto Empresa" className="perfil-imagem" />
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

                    {/* Dados */}
                    <div className="perfil-dados-container">
                        <PerfilCampo
                            label="Nome"
                            name="nome"
                            valor={formData.nome}
                            isEditing={isEditing}
                            onChange={handleChange}
                            error={errors.nome}
                        />

                        {/* Campo Especial de Senha */}
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
                                        disabled={isLoading || Object.keys(errors).some(key => errors[key] !== "")}
                                    >
                                        {isLoading ? "Salvando..." : "Atualizar"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* === SEÇÃO MEUS ALIMENTOS === */}
                <div className="meus-alimentos-wrapper-empresa">
                    <h2 className="titulo-secao">Meus Alimentos Cadastrados</h2>
                    <div className="linha-divisoria"></div>

                    {loadingAlimentos ? (
                        <p className="loading-msg">Carregando seus alimentos...</p>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>

                {/* === FOOTER DA PAGINAÇÃO === */}
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

            {/* 5. Renderização do Modal */}
            {alimentoSelecionado && (
                <ModalAlimento
                    alimento={{
                        ...alimentoSelecionado,
                        // AQUI ESTÁ A CORREÇÃO:
                        // Se não tiver 'id', ele pega o 'id_alimento' e usa como 'id'
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