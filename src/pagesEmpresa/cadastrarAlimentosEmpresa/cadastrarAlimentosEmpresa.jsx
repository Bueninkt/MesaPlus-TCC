import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './cadastrarAlimentosEmpresa.css'; // Certifique-se de que o CSS seja importado

import logo from "../../assets/icons/mesaLogo.png";

// --- NOVO: Constantes do Azure (ATENÇÃO: ATUALIZE ISTO) ---
// Use os dados do seu container do Azure para ESTE projeto (Mesa_Plus)
const AZURE_ACCOUNT = 'mesaplus'; // 1. Mude para a conta do Mesa_Plus
const AZURE_CONTAINER = 'fotos';     // 2. Mude para o container de alimentos
const SAS_TOKEN = 'sp=racwdl&st=2025-10-18T17:24:40Z&se=2025-10-18T18:39:40Z&sv=2024-11-04&sr=c&sig=u9HArr%2BEdHG9CUsI4ti%2BbQRrXtni%2FfvQ8AhCSS7VSK8%3D'; // 3. Gere um NOVO SAS Token para o container 'alimentos'

// Hardcode o ID da empresa (como já estava no handleSubmit)
const idEmpresa = 1;


/**
 * --- NOVO: Função de Upload para o Azure ---
 * Adaptada do seu código JS puro.
 */
const uploadParaAzure = async (file) => {
    // Cria um nome único para o blob
    const blobName = `${idEmpresa}_${Date.now()}_${file.name}`;

    // URL completa para a requisição PUT (com SAS Token)
    const url = `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}?${SAS_TOKEN}`;

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': file.type
        },
        body: file
    });

    if (!res.ok) {
        throw new Error(`Azure retornou status ${res.status}`);
    }

    // Retorna a URL pública (SEM o SAS Token)
    return `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}`;
};


function CadastrarAlimentosEmpresaPage() {
    // --- Estados para os campos do formulário ---
    const [nome, setNome] = useState('');
    const [dataDeValidade, setDataDeValidade] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [descricao, setDescricao] = useState('');

    // O estado 'imagem' agora guardará a URL final do Azure
    const [imagem, setImagem] = useState('');

    // --- Estados da UI ---
    const [listaCategorias, setListaCategorias] = useState([]);
    const [isCategoriaOpen, setIsCategoriaOpen] = useState(false);
    const [selectedCategorias, setSelectedCategorias] = useState({});
    const [mensagem, setMensagem] = useState('');

    // --- NOVOS Estados e Refs para Upload ---
    const [previewUrl, setPreviewUrl] = useState(null); // Para a miniatura local
    const [isUploading, setIsUploading] = useState(false); // Para feedback de loading
    const fileInputRef = useRef(null); // Para "clicar" no input escondido

    // --- BUSCAR CATEGORIAS (Conecta ao controllerCategoria.js -> categoriaDAO.js) ---
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


    // --- Funções de Manipulação (Handlers) ---

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


    // --- NOVAS Funções para Upload ---

    /**
     * Chamado quando o usuário seleciona um arquivo.
     */
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // 1. Gerar Preview Local
        const reader = new FileReader();
        reader.onload = () => {
            setPreviewUrl(reader.result); // Mostra a miniatura
        };
        reader.readAsDataURL(file);

        // 2. Fazer Upload para o Azure
        setIsUploading(true);
        setMensagem('');

        try {
            const azureUrl = await uploadParaAzure(file);
            setImagem(azureUrl); // 3. Salva a URL final do Azure no estado 'imagem'
            setMensagem('');
            setIsUploading(false);

        } catch (error) {
            console.error("Erro no upload para Azure:", error);
            setMensagem('Erro ao enviar imagem. Tente novamente.');
            setIsUploading(false);
            setPreviewUrl(null); // Limpa o preview se o upload falhar
            setImagem('');
        }
    };

    /**
     * Permite que o usuário clique no 'dropzone' para abrir o seletor de arquivos.
     */
    const handlePreviewClick = () => {
        if (isUploading) return; // Não faz nada se estiver enviando
        fileInputRef.current.click();
    };

    /**
     * Limpa o preview e a URL da imagem.
     */
    const handleRemovePreview = (event) => {
        event.stopPropagation(); // Impede que o 'handlePreviewClick' seja disparado
        setPreviewUrl(null);
        setImagem('');
        setMensagem('');
        // Reseta o valor do input para permitir selecionar o mesmo arquivo novamente
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };


    // --- SUBMISSÃO DO FORMULÁRIO (NÃO PRECISA DE MUDANÇAS) ---
    // Esta função já pega a URL do estado 'imagem', que agora é
    // preenchido pela função de upload do Azure.
    const handleSubmit = async (event) => {
        event.preventDefault();
        setMensagem('');

        // Validação extra: Impede o envio se a imagem ainda estiver carregando
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
            imagem: imagem, // <-- Esta é a URL do Azure, salva no estado
            id_empresa: idEmpresa, // ID fixo
            categorias: categoriasFormatadas
        };

        // ... (restante da lógica do handleSubmit) ...
        try {
            const response = await axios.post('http://localhost:8080/v1/mesa-plus/alimentos', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                setMensagem('Alimento cadastrado com sucesso!');
                // Limpar o formulário
                setNome('');
                setDataDeValidade('');
                setQuantidade('');
                setDescricao('');
                setImagem('');
                setPreviewUrl(null); // Limpa o preview
                setSelectedCategorias({});
                if (fileInputRef.current) fileInputRef.current.value = null; // Limpa o input file
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
            {/* ... (logo e background) ... */}
            <Link to="/sobreNosEmpresa">
                <img src={logo} alt="Mesa+ Logo" className="site-logo" />
            </Link>
            <div className="background-pattern"></div>

            <div className="form-card">
                <h1>Mesa+</h1>
                <h2>Cadastrar Alimentos</h2>

                <form className="cadastro-form" onSubmit={handleSubmit}>
                    <div className="form-columns">
                        {/* Coluna da Esquerda (sem alterações) */}
                        <div className="form-left-column">
                            {/* ... (campos Nome, Validade, Peso, Quantidade, Descrição) ... */}
                            <fieldset className="form-group">
                                <legend>Nome:</legend>
                                <input type="text" id="nome" name="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                            </fieldset>

                            <fieldset className="form-group">
                                <legend>Validade:</legend>
                                <input
                                    type="date"
                                    id="data_de_validade"
                                    name="data_de_validade"
                                    value={dataDeValidade}
                                    onChange={(e) => setDataDeValidade(e.target.value)}
                                    required
                                />
                            </fieldset>

                            <div className="form-row">
                                <fieldset className="form-group">
                                    <legend>Peso: g</legend>
                                    <input type="text" id="peso" name="peso" />
                                </fieldset>
                                <fieldset className="form-group">
                                    <legend>Quantidade:</legend>
                                    <input type="number" id="quantidade" name="quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
                                </fieldset>
                            </div>
                            <fieldset className="form-group descricao">
                                <legend>Descrição:</legend>
                                <textarea id="descricao" name="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required></textarea>
                            </fieldset>
                        </div>

                        {/* Coluna da Direita */}
                        <div className="form-right-column">

                            {/* --- NOVO: Bloco de Upload de Foto --- */}
                            <fieldset className="form-group foto">
                                <legend>
                                    <div className="add-image-icon"></div>
                                    Foto:
                                </legend>

                                {/* Input de arquivo real (fica escondido) */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/png, image/jpeg, image/webp"
                                    style={{ display: 'none' }}
                                />

                                {/* 'Dropzone' visível que mostra o preview */}
                                <div
                                    className="foto-dropzone"
                                    onClick={handlePreviewClick}
                                    style={{
                                        backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                                        cursor: isUploading ? 'progress' : 'pointer'
                                    }}
                                >
                                    {/* Botão de remover (só aparece se tiver preview) */}
                                    {previewUrl && !isUploading && (
                                        <button
                                            type="button"
                                            className="remove-preview-btn"
                                            onClick={handleRemovePreview}
                                        >
                                            &times;
                                        </button>
                                    )}

                                    {/* Placeholder (só aparece se não tiver preview) */}
                                    {!previewUrl && (
                                        <div className="upload-placeholder">
                                            {isUploading ? 'Enviando...' : 'Clique para adicionar foto'}
                                        </div>
                                    )}
                                </div>
                            </fieldset>

                            {/* Categoria (sem alterações) */}
                            <fieldset
                                className="form-group categoria-custom-select"
                                // 1. O onClick foi MOVIDO para cá
                                onClick={() => setIsCategoriaOpen(!isCategoriaOpen)}
                            >
                                <legend>Categoria:</legend>

                                {/* * O onClick foi REMOVIDO deste div.
          * Adicionamos um estilo de cursor para o header.
        */}
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
                                        // 2. ADICIONADO: Impede que o clique no dropdown feche o menu.
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
                            </fieldset>
                        </div>
                    </div>

                    {/* Mensagem de Feedback */}
                    {mensagem && (
                        <p style={{ textAlign: 'center', color: mensagem.startsWith('Erro') ? 'red' : 'green', marginTop: '1rem' }}>
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