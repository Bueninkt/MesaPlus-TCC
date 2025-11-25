import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ModalAlimento.css';
import cart from "../../assets/icons/cart.png";
import menos from "../../assets/icons/menos.png";
import mais from "../../assets/icons/mais.png";

// --- CONSTANTES DO AZURE ---
const AZURE_ACCOUNT = 'mesaplustcc';
const AZURE_CONTAINER = 'fotos';
const SAS_TOKEN = 'sp=racwdl&st=2025-10-23T12:41:46Z&se=2025-12-16T13:00:00Z&sv=2024-11-04&sr=c&sig=MzeTfPe%2Bns1vJJvi%2BazLsTIPL1YDBP2z7tDTlctlfyI%3D';

const uploadParaAzure = async (file, idEmpresa) => {
    const blobName = `${idEmpresa || 'edit'}_${Date.now()}_${file.name}`;
    const url = `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}?${SAS_TOKEN}`;
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type },
        body: file
    });
    if (!res.ok) throw new Error(`Azure retornou status ${res.status}`);
    return `https://${AZURE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${blobName}`;
};

// --- VALIDAÇÃO ---
const validateField = (name, value) => {
    switch (name) {
        case "nome":
            if (!value) return "Nome é obrigatório.";
            if (value.length < 2) return "Nome deve ter pelo menos 2 caracteres.";
            return "";
        case "data_de_validade":
            if (!value) return "Data de validade é obrigatória.";
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const [year, month, day] = value.split('-').map(Number);
            const localSelectedDate = new Date(year, month - 1, day);
            if (localSelectedDate < today) return "A data de validade não pode ser no passado.";
            return "";
        case "peso":
            if (!value) return "Peso é obrigatório.";
            const numPeso = Number(value);
            if (isNaN(numPeso)) return "Peso deve ser um número.";
            if (numPeso <= 0) return "Peso deve ser maior que zero.";
            return "";
        case "quantidade":
            if (!value) return "Quantidade é obrigatória.";
            const numQtde = Number(value);
            if (isNaN(numQtde)) return "Quantidade deve ser um número.";
            if (!Number.isInteger(numQtde)) return "Quantidade deve ser um número inteiro.";
            if (numQtde <= 0) return "Quantidade deve ser maior que zero.";
            return "";
        case "descricao":
            if (!value) return "Descrição é obrigatória.";
            if (value.length < 10) return "Descrição deve ter pelo menos 10 caracteres.";
            return "";
        case "imagem":
            if (!value) return "A foto é obrigatória.";
            return "";
        default:
            return "";
    }
};

function ModalAlimento({ 
    alimento: alimentoBase, 
    onClose, 
    isPedidoPage = false, 
    inline = false, 
    canEdit = false, 
    onUpdateSuccess 
}) {

    const navigate = useNavigate();
    const [alimentoCompleto, setAlimentoCompleto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);

    // --- ESTADOS DE EDIÇÃO ---
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    
    // --- FETCH INICIAL ---
    useEffect(() => {
        const fetchAlimento = async () => {
            const idParaBuscar = alimentoBase?.id || alimentoBase?.id_alimento;

            if (!idParaBuscar) {
                setError("Erro: ID do alimento não encontrado.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/alimento/${idParaBuscar}`);
                if (response.data && response.data.status_code === 200 && response.data.alimento && response.data.alimento.length > 0) {
                    setAlimentoCompleto(response.data.alimento[0]);
                } else {
                    throw new Error(response.data.message || "Alimento não encontrado.");
                }
            } catch (err) {
                console.error("Erro ao buscar alimento:", err);
                setError(err.message || "Falha ao carregar dados.");
            } finally {
                setLoading(false);
            }
        };
        fetchAlimento();
    }, [alimentoBase]);


    // --- LÓGICA DE VISUALIZAÇÃO ---
    const handleIncrement = () => {
        const qtd = alimentoCompleto?.quantidade || 0;
        if (quantidadeSelecionada < qtd) setQuantidadeSelecionada(p => p + 1);
    };
    const handleDecrement = () => {
        if (quantidadeSelecionada > 1) setQuantidadeSelecionada(p => p - 1);
    };
    const formatarDataModal = (dataISO) => {
        if (!dataISO) return "Data inválida";
        try { return dataISO.split('T')[0].split('-').reverse().join('/'); } catch (e) { return "Data inválida"; }
    };
    const handleModalClick = (e) => e.stopPropagation();

    // --- ADD AO CARRINHO ---
    const handleAddToCart = async () => {
         try {
             const userString = localStorage.getItem("user");
             const userType = localStorage.getItem("userType");
             if (!userString || (userType !== 'pessoa' && userType !== 'ong')) {
                 alert("Erro: Você precisa estar logado para adicionar ao carrinho.");
                 return;
             }
             const usuario = JSON.parse(userString);
             let payload = {};
             let redirectUrl = '';
             const url = 'https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/pedidoUsuario';

             if (userType === 'pessoa') {
                 payload = { id_usuario: usuario.id, id_alimento: alimentoCompleto.id, quantidade: quantidadeSelecionada };
                 redirectUrl = '/meusAlimentosUsuario';
             } else if (userType === 'ong') {
                 payload = { id_ong: usuario.id, id_alimento: alimentoCompleto.id, quantidade: quantidadeSelecionada };
                 redirectUrl = '/MeusAlimentosOng';
             }

             const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
             if (response.data && (response.data.status_code === 201 || response.data.status_code === 200)) {
                 alert("Alimento adicionado com sucesso!");
                 navigate(redirectUrl);
             } else {
                 throw new Error(response.data.message || "Erro ao adicionar ao carrinho.");
             }
         } catch (error) {
             console.error("Erro no handleAddToCart:", error);
             alert(`Erro: ${error.message}`);
         }
    };

    // --- PREPARAÇÃO EDIÇÃO ---
    const handleEditClick = () => {
        if (!alimentoCompleto) return;
        
        const dataValidade = alimentoCompleto.data_de_validade ? alimentoCompleto.data_de_validade.split('T')[0] : '';
        const idTipo = (alimentoCompleto.tipoPeso && alimentoCompleto.tipoPeso[0]) ? alimentoCompleto.tipoPeso[0].id : null;

        setEditFormData({
            nome: alimentoCompleto.nome,
            quantidade: alimentoCompleto.quantidade,
            peso: alimentoCompleto.peso,
            id_tipo_peso: idTipo, // Importante: Mantemos o ID aqui para enviar ao backend
            data_de_validade: dataValidade,
            descricao: alimentoCompleto.descricao,
            imagem: alimentoCompleto.imagem
        });
        setPreviewUrl(alimentoCompleto.imagem);
        setFormErrors({});
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setSelectedFile(null);
        setFormErrors({});
    };

    // --- CONTROLE DE INPUTS COM BLOQUEIOS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        // 1. Nome: Remove números e limita a 30 chars
        if (name === "nome") {
            finalValue = value.replace(/\d/g, '').slice(0, 30);
        }

        // 2. Quantidade: Apenas números, remove letras/símbolos, max 5 chars
        else if (name === "quantidade") {
            finalValue = value.replace(/[^0-9]/g, '').slice(0, 5);
        }

        // 3. Peso: Limita a 5 caracteres
        else if (name === "peso") {
             if (value.length > 5) return;
             finalValue = value;
        }

        // 4. Descrição: Max 500
        else if (name === "descricao") {
            finalValue = value.slice(0, 500);
        }

        setEditFormData(prev => ({ ...prev, [name]: finalValue }));
        
        const error = validateField(name, finalValue);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // --- SALVAR ---
    const handleSave = async () => {
        const errors = {};
        Object.keys(editFormData).forEach(key => {
            if (key !== 'imagem') { 
                const err = validateField(key, String(editFormData[key]));
                if (err) errors[key] = err;
            }
        });

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsUploading(true);
        try {
            let finalImageUrl = editFormData.imagem;

            if (selectedFile) {
                const idEmpresa = alimentoCompleto.id_empresa; 
                finalImageUrl = await uploadParaAzure(selectedFile, idEmpresa);
            }

            const payload = {
                ...editFormData,
                imagem: finalImageUrl,
                quantidade: Number(editFormData.quantidade),
                peso: Number(editFormData.peso)
            };

            const response = await axios.put(`https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/alimento/${alimentoCompleto.id}`, payload);

            if (response.status === 200) {
                alert("Alimento atualizado com sucesso!");
                setIsEditing(false);
                
                setAlimentoCompleto(prev => ({
                    ...prev,
                    ...payload,
                }));

                if (onUpdateSuccess) onUpdateSuccess();
            } else {
                throw new Error("Falha ao atualizar.");
            }

        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações.");
        } finally {
            setIsUploading(false);
        }
    };

    // --- RENDER ---
    if (loading) {
        if (inline) return <div className="modal-loading-inline">Carregando detalhes...</div>;
        return <div className="modal-overlay-alimento"><div className="modal-loading-feedback">Carregando...</div></div>;
    }

    if (error) {
        if (inline) return <div className="modal-error-inline">{error}</div>;
        return <div className="modal-overlay-alimento"><div className="modal-loading-feedback error">{error}<button onClick={onClose}>Fechar</button></div></div>;
    }

    const quantidadeDisponivel = alimentoCompleto.quantidade || 0;
    const prazoFormatado = formatarDataModal(alimentoCompleto.data_de_validade);
    const nomeAlimento = alimentoCompleto.nome;
    const nomeEmpresa = alimentoCompleto.empresa ? alimentoCompleto.empresa.nome : 'Empresa não informada';
    const fotoEmpresa = alimentoCompleto.empresa ? (alimentoCompleto.empresa.foto || alimentoCompleto.empresa.logo_url) : '';
    const categoriasTags = alimentoCompleto.categorias || [];
    const tipoPesoNome = (alimentoCompleto.tipoPeso && alimentoCompleto.tipoPeso[0]) ? alimentoCompleto.tipoPeso[0].tipo : 'N/A';
    const pesoCompleto = `${alimentoCompleto.peso || 'N/A'} ${tipoPesoNome}`;

    const content = (
        <div className={`modal-container ${inline ? 'container-inline' : ''}`} onClick={handleModalClick}>
            
            <button className="modal-close-button" onClick={onClose}>&times;</button>

            <header className="modal-header">
                {!isEditing ? (
                    <div className="header-flex">
                        <h2>{nomeAlimento}</h2>
                        {canEdit && (
                            <button className="btn-action-edit" onClick={handleEditClick} title="Editar Alimento">
                                ✏️ Editar
                            </button>
                        )}
                    </div>
                ) : (
                    <h2>Editando Alimento</h2>
                )}
            </header>

            <main className="modal-body">
                
                {/* COLUNA ESQUERDA (FOTO) */}
                <div className="modal-imagem-col">
                    {!isEditing ? (
                        <img src={alimentoCompleto.imagem} alt={`Imagem de ${nomeAlimento}`} />
                    ) : (
                        <div className="form-group-modal">
                             <div 
                                className="foto-dropzone-modal"
                                style={{ backgroundImage: previewUrl ? `url(${previewUrl})` : 'none' }}
                                onClick={() => !isUploading && fileInputRef.current.click()}
                             >
                                {!previewUrl && <span className="upload-placeholder-modal">Alterar Foto</span>}
                             </div>
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{display: 'none'}} 
                                onChange={handleFileChange}
                                accept="image/*"
                             />
                        </div>
                    )}
                </div>

                {/* COLUNA DIREITA (INFO) */}
                <div className="modal-info-col">
                    
                    {nomeEmpresa && !isEditing && (
                        <div className="modal-empresa-info">
                            <img src={fotoEmpresa} alt={`Logo ${nomeEmpresa}`} />
                            <span>{nomeEmpresa}</span>
                        </div>
                    )}

                    {!isEditing ? (
                        /* VISUALIZAÇÃO */
                        <>
                            <div className="modal-detalhes">
                                <h3>Detalhes</h3>
                                <p><strong>Validade:</strong> {prazoFormatado}</p>
                                <p><strong>Quantidade:</strong> {quantidadeDisponivel}</p>
                                <p><strong>Peso:</strong> {pesoCompleto}</p>
                            </div>
                            <div className="modal-descricao">
                                <h3>Descrição</h3>
                                <p>{alimentoCompleto.descricao || "Nenhuma descrição."}</p>
                            </div>
                        </>
                    ) : (
                        /* EDIÇÃO */
                        <>
                            {/* Nome */}
                            <fieldset className="form-group-modal">
                                <legend>Nome:</legend>
                                <input 
                                    type="text" 
                                    name="nome" 
                                    value={editFormData.nome} 
                                    onChange={handleInputChange} 
                                    maxLength={30}
                                />
                            </fieldset>
                            {formErrors.nome && <span className="validation-error">{formErrors.nome}</span>}

                            {/* Grid de Inputs Curtos */}
                            <div className="modal-form-grid">
                                
                                {/* Validade */}
                                <div>
                                    <fieldset className="form-group-modal">
                                        <legend>Validade:</legend>
                                        <input 
                                            type="date" 
                                            name="data_de_validade" 
                                            value={editFormData.data_de_validade} 
                                            onChange={handleInputChange} 
                                        />
                                    </fieldset>
                                    {formErrors.data_de_validade && <span className="validation-error">{formErrors.data_de_validade}</span>}
                                </div>

                                {/* Quantidade */}
                                <div>
                                    <fieldset className="form-group-modal">
                                        <legend>Quantidade:</legend>
                                        <input 
                                            type="text"
                                            name="quantidade" 
                                            value={editFormData.quantidade} 
                                            onChange={handleInputChange} 
                                            maxLength={5}
                                        />
                                    </fieldset>
                                    {formErrors.quantidade && <span className="validation-error">{formErrors.quantidade}</span>}
                                </div>

                                {/* Peso */}
                                <div>
                                    <fieldset className="form-group-modal">
                                        <legend>Peso:</legend>
                                        <input 
                                            type="number" 
                                            name="peso" 
                                            value={editFormData.peso} 
                                            onChange={handleInputChange} 
                                        />
                                    </fieldset>
                                    {formErrors.peso && <span className="validation-error">{formErrors.peso}</span>}
                                </div>

                                {/* CAMPO TIPO REMOVIDO DAQUI */}

                            </div>

                            {/* Descrição */}
                            <fieldset className="form-group-modal descricao-modal">
                                <legend>Descrição:</legend>
                                <textarea 
                                    name="descricao" 
                                    value={editFormData.descricao} 
                                    onChange={handleInputChange} 
                                    maxLength={500}
                                />
                            </fieldset>
                            {formErrors.descricao && <span className="validation-error">{formErrors.descricao}</span>}
                        </>
                    )}
                </div>
            </main>

            <footer className="modal-footer">
                <div className="footer-col categoria-col">
                    <h3>Categoria</h3>
                    <div className="tags-container">
                        {categoriasTags.length > 0 ? categoriasTags.map((cat, i) => <span key={i} className="tag">{cat.nome}</span>) : <span className="tag-none">N/C</span>}
                    </div>
                </div>

                {!isEditing ? (
                    !isPedidoPage && !canEdit && (
                        <div className="footer-col carrinho-col">
                            <button className="add-to-cart-button" onClick={handleAddToCart}>
                                <img src={cart} alt="Cart" className="cart-icon" /> Adicionar
                            </button>
                            <div className="quantity-controls">
                                <button className="quantity-button" onClick={handleDecrement} disabled={quantidadeSelecionada === 1}><img src={menos} alt="-" /></button>
                                <span className="quantity-display">{quantidadeSelecionada}</span>
                                <button className="quantity-button" onClick={handleIncrement} disabled={quantidadeSelecionada === quantidadeDisponivel}><img src={mais} alt="+" /></button>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="edit-buttons">
                        <button className="btn-cancel" onClick={handleCancelEdit} disabled={isUploading}>Cancelar</button>
                        <button className="btn-save" onClick={handleSave} disabled={isUploading}>
                            {isUploading ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                )}
            </footer>
        </div>
    );

    if (inline) {
        return <div className="modal-alimento-wrapper-inline">{content}</div>;
    }

    return <div className="modal-overlay-alimento" onClick={onClose}>{content}</div>;
}

export default ModalAlimento;