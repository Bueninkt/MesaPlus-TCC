import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './cadastrarAlimentosEmpresa.css'; 

import logo from "../../assets/icons/mesaLogo.png";

// --- Constantes do Azure ---
const AZURE_ACCOUNT = 'mesaplus';
const AZURE_CONTAINER = 'fotos';
const SAS_TOKEN = 'sp=racwdl&st=2025-10-18T17:24:40Z&se=2025-10-18T18:39:40Z&sv=2024-11-04&sr=c&sig=u9HArr%2BEdHG9CUsI4ti%2BbQRrXtni%2FfvQ8AhCSS7VSK8%3D';

const idEmpresa = 1;



// --- Função de Upload para o Azure (sem alterações) ---
const uploadParaAzure = async (file) => {
    // ... (código de upload sem alteração) ...
    const blobName = `${idEmpresa}_${Date.now()}_${file.name}`;
    const url = `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}?${SAS_TOKEN}`;
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type },
        body: file
    });
    if (!res.ok) throw new Error(`Azure retornou status ${res.status}`);
    return `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}`;
};


// --- Função de Validação (sem alterações) ---
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
            const [year, month, day] = value.split('-').map(Number);
            const localSelectedDate = new Date(year, month - 1, day);
            if (localSelectedDate < today) {
                return "A data de validade não pode ser no passado.";
            }
            return "";
        case "peso":
            if (!value) return ""; // Opcional
            const numPeso = Number(value);
            if (isNaN(numPeso)) return "Peso deve ser um número.";
            if (numPeso <= 0) return "Peso deve ser maior que zero.";
            return ""; 
        case "quantidade":
            if (!value) return "Quantidade é obrigatória.";
            const numQuantidade = Number(value);
            if (isNaN(numQuantidade)) return "Quantidade deve ser um número.";
            if (numQuantidade <= 0) return "Quantidade deve ser maior que zero.";
            if (!Number.isInteger(numQuantidade)) return "Quantidade deve ser um número inteiro.";
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
    // --- Estados para os campos do formulário ---
    const [nome, setNome] = useState('');
    const [dataDeValidade, setDataDeValidade] = useState('');
    const [peso, setPeso] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [descricao, setDescricao] = useState('');
    const [imagem, setImagem] = useState('');

    // --- Estados da UI ---
    const [listaCategorias, setListaCategorias] = useState([]);
    const [isCategoriaOpen, setIsCategoriaOpen] = useState(false);
    const [selectedCategorias, setSelectedCategorias] = useState({});
    const [mensagem, setMensagem] = useState('');
    
    // --- NOVO: Estado para rastrear interação com categoria ---
    const [categoriaInteracted, setCategoriaInteracted] = useState(false);

    // --- Estados de Upload ---
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // --- Estado para Erros de Validação ---
    const [errors, setErrors] = useState({
        nome: '',
        dataDeValidade: '',
        peso: '',
        quantidade: '',
        descricao: '',
        imagem: '',
        categorias: ''
    });

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

    // --- ATUALIZADO: useEffect para validar categorias ---
    // Agora só valida se o usuário tiver interagido (aberto o menu)
    useEffect(() => {
        // Só valida SE o usuário já interagiu E fechou o menu
        if (categoriaInteracted && !isCategoriaOpen && listaCategorias.length > 0) { 
            const selecionadas = Object.keys(selectedCategorias).filter(id => selectedCategorias[id] === true);
            const error = validateField('categorias', selecionadas);
            setErrors(prev => ({
                ...prev,
                categorias: error
            }));
        }
    }, [isCategoriaOpen, selectedCategorias, listaCategorias, categoriaInteracted]); // <-- Dependência adicionada


    // --- Funções de Manipulação (Handlers - sem alterações) ---
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

    // --- Funções para Upload (sem alterações) ---
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { setPreviewUrl(reader.result); };
        reader.readAsDataURL(file);
        setIsUploading(true);
        setMensagem('');
        setErrors(prev => ({ ...prev, imagem: '' })); 
        try {
            const azureUrl = await uploadParaAzure(file);
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

    // --- Funções de Validação (sem alterações) ---
    const handleBlur = (event) => {
        const { name, value } = event.target;
        const error = validateField(name, value);
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const handleValidation = () => {
        const categoriasSelecionadas = Object.keys(selectedCategorias).filter(id => selectedCategorias[id] === true);
        const newErrors = {
            nome: validateField('nome', nome),
            dataDeValidade: validateField('dataDeValidade', dataDeValidade),
            peso: validateField('peso', peso),
            quantidade: validateField('quantidade', quantidade),
            descricao: validateField('descricao', descricao),
            imagem: validateField('imagem', imagem),
            categorias: validateField('categorias', categoriasSelecionadas)
        };
        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === "");
    };

    // --- SUBMISSÃO DO FORMULÁRIO (sem alterações) ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setMensagem('');

        // Define que a categoria foi "interagida" no submit,
        // caso o usuário tente enviar sem nunca ter clicado nela.
        setCategoriaInteracted(true); 

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
        const payload = {
            nome: nome,
            quantidade: Number(quantidade),
            data_de_validade: dataDeValidade,
            descricao: descricao,
            imagem: imagem,
            id_empresa: idEmpresa, 
            categorias: categoriasFormatadas,
            peso: peso ? Number(peso) : undefined 
        };
        try {
            const response = await axios.post('http://localhost:8080/v1/mesa-plus/alimentos', payload, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.status === 200) {
                setMensagem('Alimento cadastrado com sucesso!');
                setNome('');
                setDataDeValidade('');
                setPeso('');
                setQuantidade('');
                setDescricao('');
                setImagem('');
                setPreviewUrl(null); 
                setSelectedCategorias({});
                if (fileInputRef.current) fileInputRef.current.value = null; 
                setErrors({ nome: '', dataDeValidade: '', peso: '', quantidade: '', descricao: '', imagem: '', categorias: '' });
                setCategoriaInteracted(false); // Reseta a interação
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
                                {/* ATUALIZADO: Span de erro sempre presente (controlado pelo CSS) */}
                                <span className="validation-error">{errors.nome}</span>
                            </fieldset>

                            <fieldset className="form-group">
                                <legend>Validade:</legend>
                                <input
                                    type="date"
                                    id="data_de_validade"
                                    name="dataDeValidade"
                                    value={dataDeValidade}
                                    onChange={(e) => setDataDeValidade(e.target.value)}
                                    onBlur={handleBlur}
                                />
                                {/* ATUALIZADO: Span de erro sempre presente */}
                                <span className="validation-error">{errors.dataDeValidade}</span>
                            </fieldset>

                            <div className="form-row">
                                <fieldset className="form-group">
                                    <legend>Peso: grama</legend>
                                    <input
                                        type="number"
                                        id="peso"
                                        name="peso"
                                        value={peso}
                                        maxLength={5}
                                        onChange={(e) => setPeso(e.target.value)}
                                        onBlur={handleBlur}
                                    />
                                    {/* ATUALIZADO: Span de erro sempre presente */}
                                    <span className="validation-error">{errors.peso}</span>
                                </fieldset>
                                <fieldset className="form-group">
                                    <legend>Quantidade:</legend>
                                    <input
                                        type="number"
                                        id="quantidade"
                                        name="quantidade"
                                        value={quantidade}
                                        onChange={(e) => setQuantidade(e.target.value)}
                                        onBlur={handleBlur}
                                    />
                                    {/* ATUALIZADO: Span de erro sempre presente */}
                                    <span className="validation-error">{errors.quantidade}</span>
                                </fieldset>
                            </div>
                            <fieldset className="form-group descricao">
                                <legend>Descrição:</legend>
                                <textarea
                                    id="descricao"
                                    name="descricao"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    onBlur={handleBlur}
                                ></textarea>
                                {/* ATUALIZADO: Span de erro sempre presente */}
                                <span className="validation-error">{errors.descricao}</span>
                            </fieldset>
                        </div>

                        {/* Coluna da Direita */}
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
                                            &times;
                                        </button>
                                    )}
                                    {!previewUrl && (
                                        <div className="upload-placeholder">
                                            {isUploading ? 'Enviando...' : 'Clique para adicionar foto'}
                                        </div>
                                    )}
                                </div>
                                {/* ATUALIZADO: Span de erro sempre presente. O CSS vai alinhar */}
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
                                {/* ATUALIZADO: Span de erro sempre presente */}
                                <span className="validation-error">{errors.categorias}</span>
                            </fieldset>
                        </div>
                    </div>

                    {/* Mensagem de Feedback (sem alteração) */}
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