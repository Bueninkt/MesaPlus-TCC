import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes e Estilos
import './MeuPerfilEmpresa.css';
import NavbarEmpresa from '../../components/navbarEmpresa/navbarEmpresa';
import AlimentoCard from '../../components/AlimentoCard/AlimentoCard';
import Paginacao from '../../components/PaginacaoCard/Paginacao';
import ModalAlimento from '../../components/ModalAlimento/ModalAlimento';

// Assets
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';

// =========================================================
// CONFIGURAÇÕES
// =========================================================

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
      
      if (!value.includes("@")) return "Email deve conter um '@'.";
      const parts = value.split('@');
      if (parts.length !== 2 || parts[0].length === 0 || parts[1].length < 3) {
        return "Formato de email inválido.";
      }
      const domainPart = parts[1];
      if (!domainPart.includes('.')) return "O domínio precisa de um ponto.";
      const tld = domainPart.split('.').pop();
      if (tld.length < 2) return "Final do domínio inválido.";
      return "Formato de email inválido.";

    case "telefone":
      const phoneDigits = value.replace(/\D/g, "");
      if (phoneDigits.length < 10) return "Telefone deve ter 10 ou 11 dígitos.";
      return "";

    // Validação do Endereço (Alinhado com Controller Node.js)
   case "endereco":
      if (!value || value.trim() === "") return "Endereço é obrigatório.";
      
      if (value.length > 150) return "O endereço deve ter no máximo 150 caracteres.";
      
      // --- NOVA VALIDAÇÃO ---
      // Regex que verifica se existe pelo menos uma letra (a-z, A-Z) 
      // ou letras com acentos (\u00C0-\u00FF inclui á, é, ã, ç, etc.)
      const temLetras = /[a-zA-Z\u00C0-\u00FF]/.test(value);
      
      if (!temLetras) {
        return "O endereço deve conter o nome da rua ou bairro.";
      }

      // Sugestão opcional: Adicionar um tamanho mínimo para evitar endereços como "Rua A" muito curtos
      if (value.trim().length < 5) {
        return "O endereço está muito curto.";
      }

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
    
    // ALTERAÇÃO: Aumentado para 6 para ficar visualmente melhor no grid (2 linhas de 3)
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

                const response = await fetch(`https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/empresa/${user.id}`);
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
                const response = await fetch(`https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/empresaAlimento/${idEmpresa}`);
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
    
    // Cálculos da Paginação
    const totalPages = Math.ceil(meusAlimentos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    // Esta variável contém APENAS os itens da página atual
    const currentAlimentos = meusAlimentos.slice(startIndex, endIndex);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
            setSelectedFile(file);
            setFotoRemovida(false);
            setErrors(prev => ({ ...prev, imagem: "" }));
        }
    };

    const handleRemovePhoto = () => {
        setProfileImage(URL_FOTO_PADRAO);
        setSelectedFile(null);
        setFotoRemovida(true);
    };

    const handleDeleteAlimento = async (idAlimento) => {
        if (window.confirm("Tem certeza que deseja excluir este alimento?")) {
            try {
                const response = await fetch(`https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/alimento/${idAlimento}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert("Alimento excluído com sucesso!");
                    // Remove da lista local para atualizar a tela sem reload
                    setMeusAlimentos(prev => prev.filter(item => (item.id_alimento || item.id) !== idAlimento));
                    
                    // Se a página ficar vazia após excluir, volta uma página
                    if (currentAlimentos.length === 1 && currentPage > 1) {
                         setCurrentPage(prev => prev - 1);
                    }

                } else {
                    alert("Erro ao excluir alimento.");
                }
            } catch (error) {
                console.error("Erro na exclusão:", error);
                alert("Erro de conexão com o servidor.");
            }
        }
    };

  const handleChange = (event) => {
        const { name, value } = event.target;
        let maskedValue = value;

        // =========================================================
        // LIMITES DE CARACTERES (NOVA LÓGICA)
        // =========================================================
        
        // Limite para Nome (18 caracteres)
        if (name === "nome" && value.length > 18) {
            maskedValue = value.slice(0, 18);
        }
        
        // Limite para Email (45 caracteres)
        if (name === "email" && value.length > 45) {
            maskedValue = value.slice(0, 45);
        }

        if (name === "telefone") maskedValue = maskPhone(value);
        else if (name === "cnpj") maskedValue = maskCNPJ(value);

        // Atualiza o estado e valida
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

        setProfileImage(originalData.fotoUrl || URL_FOTO_PADRAO);
        setSelectedFile(null);
        setFotoRemovida(false);
        setErrors({});
        setIsEditing(false);
    };

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

            if (selectedFile) {
                console.log("Ação: Upload de nova foto.");
                urlParaSalvar = await uploadParaAzure(selectedFile, idEmpresa);

            } else if (fotoRemovida) {
                console.log("Ação: Resetando para foto padrão (URL fixa).");
                urlParaSalvar = URL_FOTO_PADRAO;

            } else {
                console.log("Ação: Mantendo foto atual.");
                urlParaSalvar = originalData.fotoUrl;
            }

            const telefoneLimpo = formData.telefone.replace(/\D/g, "");
            const enderecoLimpo = formData.endereco ? formData.endereco.trim() : null;

            const dadosParaEnviar = {
                nome: formData.nome,
                email: formData.email,
                telefone: telefoneLimpo,
                endereco: enderecoLimpo,
                foto: urlParaSalvar
            };

            if (formData.senha !== originalPasswordHash) {
                dadosParaEnviar.senha = formData.senha;
            }

            const response = await fetch(`https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/empresa/${idEmpresa}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaEnviar)
            });

            if (!response.ok) throw new Error(await response.text());

            const result = await response.json();

            if (result.status) {
                alert("Perfil atualizado com sucesso!");
                setIsEditing(false);

                setOriginalData({ ...formData, fotoUrl: urlParaSalvar });
                setProfileImage(urlParaSalvar);
                
                setSelectedFile(null);
                setFotoRemovida(false);

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
                                // AQUI ESTAVA O SEGREDO: Usar currentAlimentos.map
                                currentAlimentos.map((item) => (
                                    <AlimentoCard
                                        key={item.id_alimento || item.id}
                                        alimento={item}
                                        onCardClick={handleCardClick}
                                        onDeleteClick={() => handleDeleteAlimento(item.id_alimento || item.id)}
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
                    canEdit={true}
                    isPedidoPage={true}
                    onUpdateSuccess={() => {
                        window.location.reload();
                    }}
                />
            )}
        </>
    );
}

export default MeuPerfilEmpresaPage;