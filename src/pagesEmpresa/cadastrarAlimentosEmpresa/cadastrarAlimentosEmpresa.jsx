import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './cadastrarAlimentosEmpresa.css';

import logo from "../../assets/icons/mesaLogo.png";

// --- Constantes do Azure ---
const AZURE_ACCOUNT = 'mesaplustcc';
const AZURE_CONTAINER = 'fotos';
const SAS_TOKEN = 'sp=racwdl&st=2025-10-23T12:41:46Z&se=2025-12-16T13:00:00Z&sv=2024-11-04&sr=c&sig=MzeTfPe%2Bns1vJJvi%2BazLsTIPL1YDBP2z7tDTlctlfyI%3D';


// --- Função de Upload (sem alteração) ---
const uploadParaAzure = async (file, idEmpresa) => {
    const idUsuario = idEmpresa || 'id_desconhecido';
    const blobName = `${idUsuario}_${Date.now()}_${file.name}`;
    const url = `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}?${SAS_TOKEN}`;
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type },
        body: file
    });
    if (!res.ok) throw new Error(`Azure retornou status ${res.status}`);
    return `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}`;
};

// --- Função de Validação (REFATORADA) ---
const validateField = (name, value) => {
    switch (name) {
        case "nome":
            if (!value) return "Nome é obrigatório.";
            if (value.length < 2) return "Nome deve ter pelo menos 2 caracteres.";
            return "";
        case "dataDeValidade":
            if (!value) return "Data de validade é obrigatória.";
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const [day, month, year] = value.split('-').map(Number);
            const localSelectedDate = new Date(day, month - 1, year);
            if (localSelectedDate < today) {
                return "A data de validade não pode ser no passado.";
            }
            return "";

        // --- REMOVIDOS: "peso" e "quantidade" ---

        // --- ADICIONADOS: Novos campos ---
        case "valorMedida":
            if (!value) return "Valor é obrigatório.";
            const numValor = Number(value);
            if (isNaN(numValor)) return "Valor deve ser um número.";
            if (numValor <= 0) return "Valor deve ser maior que zero.";
            return "";

        case "idUnidadeSelecionada":
            if (!value) return "Unidade de medida é obrigatória.";
            return "";

        case "descricao":
            if (!value) return "Descrição é obrigatória.";
            if (value.length < 10) return "Descrição deve ter pelo menos 10 caracteres.";
            return "";
        case "imagem":
            if (!value) return "A foto é obrigatória.";
            return "";
        case "categorias":
            if (!value || value.length === 0) return "Selecione ao menos uma categoria.";
            return "";
        default:
            return "";
    }
};


function CadastrarAlimentosEmpresaPage() {
    const [idEmpresa, setIdEmpresa] = useState(null);
    const navigate = useNavigate();

    // --- Estados para os campos do formulário (REFATORADOS) ---
    const [nome, setNome] = useState('');
    const [dataDeValidade, setDataDeValidade] = useState('');
    // --- REMOVIDO: peso, setPeso ---
    // --- REMOVIDO: quantidade, setQuantidade ---
    const [descricao, setDescricao] = useState('');
    const [imagem, setImagem] = useState('');

    // --- ADICIONADO: Novos estados para Valor e Unidade ---
    const [valorMedida, setValorMedida] = useState('');
    const [listaUnidades, setListaUnidades] = useState([]);
    const [idUnidadeSelecionada, setIdUnidadeSelecionada] = useState(null);
    const [isUnidadeOpen, setIsUnidadeOpen] = useState(false);
    const [unidadeInteracted, setUnidadeInteracted] = useState(false);

    // --- Estados da UI (Categoria) ---
    const [listaCategorias, setListaCategorias] = useState([]);
    const [isCategoriaOpen, setIsCategoriaOpen] = useState(false);
    const [selectedCategorias, setSelectedCategorias] = useState({});
    const [mensagem, setMensagem] = useState('');
    const [categoriaInteracted, setCategoriaInteracted] = useState(false);

    // --- Estados de Upload ---
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // --- Estado para Erros de Validação (REFATORADO) ---
    const [errors, setErrors] = useState({
        nome: '',
        dataDeValidade: '',
        // --- REMOVIDO: peso, quantidade ---
        valorMedida: '', // --- ADICIONADO ---
        idUnidadeSelecionada: '', // --- ADICIONADO ---
        descricao: '',
        imagem: '',
        categorias: ''
    });

    // --- useEffect para verificar autenticação (sem alteração) ---
    useEffect(() => {
        try {
            const userString = localStorage.getItem("user");
            const userType = localStorage.getItem("userType");

            if (userString && userType === 'empresa') {
                const usuario = JSON.parse(userString);
                if (usuario && usuario.id) {
                    setIdEmpresa(usuario.id);
                } else {
                    console.error("Dados do usuário incompletos no localStorage.");
                    localStorage.clear();
                    navigate('/login');
                }
            } else {
                console.warn("Acesso não autorizado. Redirecionando para login.");
                navigate('/login');
            }
        } catch (error) {
            console.error("Erro ao processar dados do usuário:", error);
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    // --- BUSCAR CATEGORIAS (sem alterações) ---
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get('http://localhost:8080/v1/mesa-plus/categoria');
                if (response.data && response.data.categorias) {
                    setListaCategorias(response.data.categorias);
                }
            } catch (error) {
                console.error("Erro ao buscar categorias:", error);
                setMensagem("Falha ao carregar categorias. Tente recarregar a página.");
            }
        };
        fetchCategorias();
    }, []);

    // --- NOVO: useEffect para buscar Unidades de Medida ---
    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const response = await axios.get('http://localhost:8080/v1/mesa-plus/unidades-medida');
                if (response.data && response.data.unidades) {
                    setListaUnidades(response.data.unidades);
                }
            } catch (error) {
                console.error("Erro ao buscar unidades de medida:", error);
                setMensagem("Erro: Falha ao carregar unidades. Tente recarregar a página.");
            }
        };
        fetchUnidades();
    }, []); // Roda apenas uma vez na montagem

    // --- useEffect para validar categorias (sem alteração) ---
    useEffect(() => {
        if (categoriaInteracted && !isCategoriaOpen && listaCategorias.length > 0) {
            const selecionadas = Object.keys(selectedCategorias).filter(id => selectedCategorias[id] === true);
            const error = validateField('categorias', selecionadas);
            setErrors(prev => ({
                ...prev,
                categorias: error
            }));
        }
    }, [isCategoriaOpen, selectedCategorias, listaCategorias, categoriaInteracted]);

    // --- NOVO: useEffect para validar Unidade de Medida ---
    useEffect(() => {
        if (unidadeInteracted && !isUnidadeOpen && listaUnidades.length > 0) {
            const error = validateField('idUnidadeSelecionada', idUnidadeSelecionada);
            setErrors(prev => ({ ...prev, idUnidadeSelecionada: error }));
        }
    }, [isUnidadeOpen, idUnidadeSelecionada, listaUnidades, unidadeInteracted]);

    // --- Funções de Manipulação (Categoria) ---
    const handleCategoriaChange = (event) => {
        const { id, checked } = event.target;
        setSelectedCategorias(prevState => ({
            ...prevState,
            [id]: checked,
        }));
    };

    const getCategoriaDisplayText = () => {
        const selecionadas = Object.keys(selectedCategorias).filter(
            (key) => selectedCategorias[key]
        );
        if (selecionadas.length === 0) return 'Selecione uma ou mais categorias';
        return selecionadas
            .map(id => listaCategorias.find(cat => cat.id === Number(id))?.nome)
            .join(', ');
    };

    // --- NOVAS: Funções de Manipulação para Unidade de Medida ---
    const handleUnidadeChange = (unidadeId) => {
        setIdUnidadeSelecionada(unidadeId);
        setIsUnidadeOpen(false); // Fecha o dropdown ao selecionar
    };

    const getUnidadeDisplayText = () => {
        if (!idUnidadeSelecionada) return 'Selecione uma unidade';
        const selecionada = listaUnidades.find(u => u.id === idUnidadeSelecionada);
        return selecionada ? selecionada.nome : 'Selecione uma unidade';
    };

    // --- Funções para Upload (sem alteração) ---
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!idEmpresa) {
            setMensagem("Erro de autenticação. Tente relogar.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => { setPreviewUrl(reader.result); };
        reader.readAsDataURL(file);
        setIsUploading(true);
        setMensagem('');
        setErrors(prev => ({ ...prev, imagem: '' }));
        try {
            const azureUrl = await uploadParaAzure(file, idEmpresa);
            setImagem(azureUrl);
            setMensagem('');
            setIsUploading(false);
            setErrors(prev => ({ ...prev, imagem: '' }));
        } catch (error) {
            console.error("Erro no upload para Azure:", error);
            setIsUploading(false);
            setPreviewUrl(null);
            setImagem('');
            setErrors(prev => ({ ...prev, imagem: 'Falha no upload. Tente novamente.' }));
        }
    };

    const handlePreviewClick = () => {
        if (isUploading) return;
        fileInputRef.current.click();
    };

    const handleRemovePreview = (event) => {
        event.stopPropagation();
        setPreviewUrl(null);
        setImagem('');
        setMensagem('');
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
        setErrors(prev => ({ ...prev, imagem: 'A foto é obrigatória.' }));
    };

    // --- Funções de Validação ---
    const handleBlur = (event) => {
        const { name, value } = event.target;
        const error = validateField(name, value);
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
    };

    // --- Validação (REFATORADA) ---
    const handleValidation = () => {
        const categoriasSelecionadas = Object.keys(selectedCategorias).filter(id => selectedCategorias[id] === true);
        const newErrors = {
            nome: validateField('nome', nome),
            dataDeValidade: validateField('dataDeValidade', dataDeValidade),
            // --- REMOVIDO: peso, quantidade ---
            valorMedida: validateField('valorMedida', valorMedida), // --- ADICIONADO ---
            idUnidadeSelecionada: validateField('idUnidadeSelecionada', idUnidadeSelecionada), // --- ADICIONADO ---
            descricao: validateField('descricao', descricao),
            imagem: validateField('imagem', imagem),
            categorias: validateField('categorias', categoriasSelecionadas)
        };
        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === "");
    };

    // --- SUBMISSÃO DO FORMULÁRIO (REFATORADO) ---
    const handleSubmit = async (event) => {

        event.preventDefault();
        setMensagem('');

        if (!idEmpresa) {
            setMensagem("Erro: ID da empresa não encontrado. Faça login novamente.");
            return;
        }

        setCategoriaInteracted(true);
        setUnidadeInteracted(true); // --- ADICIONADO ---

        if (!handleValidation()) {
            setMensagem("Por favor, corrija os erros no formulário.");
            return;
        }
        if (isUploading) {
            setMensagem("Por favor, aguarde o envio da imagem terminar.");
            return;
        }
        const categoriasFormatadas = Object.keys(selectedCategorias)
            .filter(id => selectedCategorias[id] === true)
            .map(id => ({ id: Number(id) }));

        // --- ALTERADO: O payload agora usa 'valorMedida' e 'idUnidadeSelecionada' ---
        const payload = {
            nome: nome,
            data_de_validade: dataDeValidade,
            descricao: descricao,
            imagem: imagem,
            id_empresa: idEmpresa,
            categorias: categoriasFormatadas,
            valor_medida: Number(valorMedida),
            id_unidade_medida: idUnidadeSelecionada
        }
        try {
            const response = await axios.post('http://localhost:8080/v1/mesa-plus/alimentos', payload, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.status === 200) {
                setMensagem('Alimento cadastrado com sucesso!');
                setNome('');
                setDataDeValidade('');
                // --- REMOVIDO: setPeso, setQuantidade ---
                // --- ADICIONADO ---
                setValorMedida('');
                setIdUnidadeSelecionada(null);

                setDescricao('');
                setImagem('');
                setPreviewUrl(null);
                setSelectedCategorias({});
                if (fileInputRef.current) fileInputRef.current.value = null;
                // --- ATUALIZADO: reset de erros ---
                setErrors({ nome: '', dataDeValidade: '', valorMedida: '', idUnidadeSelecionada: '', descricao: '', imagem: '', categorias: '' });
                setCategoriaInteracted(false);
                setUnidadeInteracted(false); // --- ADICIONADO ---
            } else {
                setMensagem(response.data.message || 'Ocorreu um erro ao cadastrar.');
            }
        } catch (error) {
            console.error("Erro ao enviar formulário:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setMensagem(`Erro: ${error.response.data.message}`);
            } else {
                setMensagem('Erro de conexão. Não foi possível cadastrar o alimento.');
            }
        }
    };


    // --- Tela de Loading de Autenticação (sem alteração) ---
    if (!idEmpresa) {
        return (
            <div className="page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <p>Verificando autenticação...</p>
            </div>
        );
    }

    // --- JSX (RENDER) ---
    return (
        <div className="page-container">
            <Link to="/sobreNosEmpresa">
                <img src={logo} alt="Mesa+ Logo" className="site-logo" />
            </Link>
            <div className="background-pattern"></div>

            <div className="form-card">
                <h1>Mesa+</h1>
                <h2>Cadastrar Alimentos</h2>

                <form className="cadastro-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-columns">
                        {/* Coluna da Esquerda */}
                        <div className="form-left-column">
                            <fieldset className="form-group">
                                <legend>Nome:</legend>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    onBlur={handleBlur}
                                />
                                <span className="validation-error">{errors.nome}</span>
                            </fieldset>

                            <fieldset className="form-group">
                                <legend>Validade:</legend>
                                <input
                                    type="date"
                                    id="data_de_validade"
                                    name="dataDeValidade"
                                    _ value={dataDeValidade}
                                    onChange={(e) => setDataDeValidade(e.target.value)}
                                    onBlur={handleBlur}
                                />
                                <span className="validation-error">{errors.dataDeValidade}</span>
                            </fieldset>

                            {/* --- LINHA REFATORADA (Peso e Quantidade -> Valor e Unidade) --- */}
                            <div className="form-row">
                                {/* --- CAMPO "VALOR" ADICIONADO --- */}
                                <fieldset className="form-group">
                                    <legend>valor de Medida:</legend>
                                    <input
                                        type="number"
                                        name="valorMedida"
                                        value={valorMedida}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 5) {
                                                setValorMedida(e.target.value);
                                            }
                                        }}
                                        onBlur={handleBlur}
                                    />
                                    <span className="validation-error">{errors.valorMedida}</span>
                                </fieldset>

                                {/* --- CAMPO "UNIDADE" CUSTOMIZADO ADICIONADO --- */}
                                <fieldset
                                    className="form-group categoria-custom-select"
                                    onClick={() => {
                                        setIsUnidadeOpen(!isUnidadeOpen);
                                        setUnidadeInteracted(true);
                                    }}
                                >
                                    <legend>Unidade de Medida:</legend>
                                    <div className="categoria-select-header" style={{ cursor: 'pointer' }}>
                                        <span className="categoria-display-text">
                                            {getUnidadeDisplayText()}
                                        </span>
                                        <div className={`dropdown-arrow ${isUnidadeOpen ? 'open' : ''}`}></div>
                                    </div>

                                    {isUnidadeOpen && (
                                        <div
                                            className="categoria-dropdown-list"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {listaUnidades.length > 0 ? (
                                                listaUnidades.map((unidade) => (
                                                    <div
                                                        className="unidade-dropdown-item"
                                                        key={unidade.id}
                                                        onClick={() => handleUnidadeChange(unidade.id)}
                                                    >
                                                        {unidade.nome}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="categoria-loading">Carregando...</div>
                                            )}
                                        </div>
                                    )}
                                    <span className="validation-error">{errors.idUnidadeSelecionada}</span>
                                </fieldset>
                            </div>
                            {/* --- FIM DA LINHA REFATORADA --- */}

                            <fieldset className="form-group descricao">
                                <legend>Descrição:</legend>
                                <textarea
                                    id="descricao"
                                    name="descricao"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    onBlur={handleBlur}
                                ></textarea>
                                <span className="validation-error">{errors.descricao}</span>
                            </fieldset>
                        </div>

                        {/* Coluna da Direita (Foto e Categoria) */}
                        <div className="form-right-column">
                            <fieldset className="form-group foto">
                                <legend>
                                    <div className="add-image-icon"></div>
                                    Foto:
                                </legend>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/png, image/jpeg, image/webp"
                                    style={{ display: 'none' }}
                                />
                                <div
                                    className="foto-dropzone"
                                    onClick={handlePreviewClick}
                                    style={{
                                        backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                                        cursor: isUploading ? 'progress' : 'pointer'
                                    }}
                                >
                                    {previewUrl && !isUploading && (
                                        <button
                                            type="button"
                                            className="remove-preview-btn"
                                            onClick={handleRemovePreview}
                                        >
                                      
                                        </button>
                                    )}
                                    {!previewUrl && (
                                        <div className="upload-placeholder">
                                        {isUploading ? 'Enviando...' : 'Clique para adicionar foto'}
                                        </div>
                                    )}
                                </div>
                                <span className="validation-error">{errors.imagem}</span>
                                       </fieldset>

                            <fieldset
                                className="form-group categoria-custom-select"
                                onClick={() => {
                                    setIsCategoriaOpen(!isCategoriaOpen);
                                    setCategoriaInteracted(true);
                                }}
                            >
                                <legend>Categoria:</legend>
                                <div
                                    className="categoria-select-header"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className="categoria-display-text">
                                        {getCategoriaDisplayText()}
                                    </span>
                                    <div className={`dropdown-arrow ${isCategoriaOpen ? 'open' : ''}`}></div>
                                </div>
                                {isCategoriaOpen && (
                                    <div
                                        className="categoria-dropdown-list"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {listaCategorias.length > 0 ? (
                                            listaCategorias.map((opcao) => (
                                                <label className="checkbox-container" key={opcao.id}>
                                                    <input type="checkbox" id={opcao.id} name="categoria" value={opcao.id} checked={!!selectedCategorias[opcao.id]} onChange={handleCategoriaChange} />
                                                    <span className="custom-checkbox"></span>
                                                    {opcao.nome}
                                                </label>
                                            ))
                                        ) : (
                                            <div className="categoria-loading">Carregando...</div>
                                        )}
                                    </div>
                                )}
                                <span className="validation-error">{errors.categorias}</span>
                            </fieldset>
                        </div>
                    </div>

                    {/* Mensagem de Feedback */}
                    {mensagem && (
                        <p className={`
                                    feedback-message 
                                    ${mensagem.startsWith('Erro') || mensagem.startsWith('Por favor') ? 'error' : 'success'}
                                `}>
                            {mensagem}
                        </p>
                    )}

                    <button type="submit" className="submit-button" disabled={isUploading}>
                        {isUploading ? 'Aguarde...' : 'Cadastrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CadastrarAlimentosEmpresaPage;