
import React, { useState, useEffect } from 'react';
import './filtrar.css';
import seta from '../../assets/icons/seta.png';

function Filtrar({ onFilterChange }) {
    const [secaoAberta, setSecaoAberta] = useState(null);

    const [listaCategorias, setListaCategorias] = useState([]);
    const [listaEmpresas, setListaEmpresas] = useState([]);

    const [categoriaAtiva, setCategoriaAtiva] = useState(null);
    const [dataVencimento, setDataVencimento] = useState('');
    const [empresaAtivaId, setEmpresaAtivaId] = useState(null);


    useEffect(() => {
        const buscarDadosIniciais = async () => {

            try {
                const response = await fetch('http://localhost:8080/v1/mesa-plus/categoria');
                if (response.ok) {
                    const data = await response.json();
                    if (data.status && data.categorias) {
                        setListaCategorias(data.categorias);
                    }
                } else {
                    console.error(`Erro ao buscar categorias: ${response.status}`);
                }
            } catch (error) {
                console.error('Erro de rede ao buscar categorias:', error);
            }

            try {
                const response = await fetch('http://localhost:8080/v1/mesa-plus/empresa');
                if (response.ok) {
                    const data = await response.json();
                    if (data.status && data.empresas) {
                        setListaEmpresas(data.empresas);
                    }
                } else {
                    console.error(`Erro ao buscar empresas: ${response.status}`);
                }
            } catch (error) {
                console.error('Erro de rede ao buscar empresas:', error);
            }
        };

        buscarDadosIniciais();
    }, []); 

    useEffect(() => {
        if (onFilterChange) {
            onFilterChange({
                categoriaId: categoriaAtiva,
                empresaId: empresaAtivaId,
                dataVencimento,
            });
        }
    }, [categoriaAtiva, dataVencimento, empresaAtivaId, onFilterChange]);

    const handleToggleSecao = (secao) => {
        setSecaoAberta(secaoAberta === secao ? null : secao);
    };

    const handleCategoriaChange = (event) => {
        const id = parseInt(event.target.value);
        const novoId = categoriaAtiva === id ? null : id;
        setCategoriaAtiva(novoId);
        setEmpresaAtivaId(null); 
        setDataVencimento(''); 
    };

    const handleLimparCategoria = (e) => {
        e.stopPropagation();
        setCategoriaAtiva(null);
    };

    const handleEmpresaChange = (event) => {
        const id = parseInt(event.target.value);
        const novoId = empresaAtivaId === id ? null : id;
        setEmpresaAtivaId(novoId);
        setCategoriaAtiva(null); 
        setDataVencimento(''); 
    };

    const handleLimparEmpresa = (e) => {
        e.stopPropagation();
        setEmpresaAtivaId(null);
    };

    const handleDataChange = (e) => {
        setDataVencimento(e.target.value); 
        setCategoriaAtiva(null); 
        setEmpresaAtivaId(null); 
    };

    const handleLimparData = (e) => {
        e.stopPropagation();
        setDataVencimento('');
    };

    return (
        <main className="filtrar-container">
            <h2 className="filtrar-titulo">Filtrar por:</h2>

            <div className="filtro-secao">
                <button className="filtro-barra" onClick={() => handleToggleSecao('categoria')}>
                    <span>Categoria:</span>
                    <img
                        src={seta}
                        alt="Abrir/Fechar"
                        className={`filtro-seta ${secaoAberta === 'categoria' ? 'aberta' : ''}`}
                    />
                </button>
                {secaoAberta === 'categoria' && (
                    <div className="filtro-conteudo categoria">
                        {listaCategorias.length > 0 ? (
                            listaCategorias.map((cat) => (
                                <div key={cat.id} className="filtro-item">
                                    <input
                                        type="radio"
                                        id={`cat-${cat.id}`}
                                        name="categoria_filtro"
                                        value={cat.id}
                                        checked={categoriaAtiva === cat.id}
                                        onChange={handleCategoriaChange}
                                    />
                                    <label htmlFor={`cat-${cat.id}`}>{cat.nome}</label>
                                </div>
                            ))
                        ) : (
                            <p>Carregando categorias...</p>
                        )}
                        {categoriaAtiva && (
                            <button onClick={handleLimparCategoria} className="filtro-limpar-btn">
                                Limpar filtro
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="filtro-secao">
                <button className="filtro-barra" onClick={() => handleToggleSecao('data')}>
                    <span>Data de Validade:</span>
                    <img
                        src={seta}
                        alt="Abrir/Fechar"
                        className={`filtro-seta ${secaoAberta === 'data' ? 'aberta' : ''}`}
                    />
                </button>
                {secaoAberta === 'data' && (
                    <div className="filtro-conteudo data">
                        <input
                            type="date"
                            className="filtro-input-data"
                            value={dataVencimento}
                            onChange={handleDataChange}
                        />
                        {dataVencimento && (
                            <button onClick={handleLimparData} className="filtro-limpar-btn">
                                Limpar filtro
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="filtro-secao">
                <button className="filtro-barra" onClick={() => handleToggleSecao('empresa')}>
                    <span>Empresas:</span>
                    <img
                        src={seta}
                        alt="Abrir/Fechar"
                        className={`filtro-seta ${secaoAberta === 'empresa' ? 'aberta' : ''}`}
                    />
                </button>
                {secaoAberta === 'empresa' && (
                    <div className="filtro-conteudo empresa">
                        {listaEmpresas.length > 0 ? (
                            listaEmpresas.map((emp) => (
                                <div key={emp.id} className="filtro-item">
                                    <input
                                        type="radio"
                                        id={`emp-${emp.id}`}
                                        name="empresa_filtro"
                                        value={emp.id}
                                        checked={empresaAtivaId === emp.id}
                                        onChange={handleEmpresaChange}
                                    />
                                    <label htmlFor={`emp-${emp.id}`}>{emp.nome}</label>
                                </div>
                            ))
                        ) : (
                            <p>Carregando empresas...</p>
                        )}
                        {empresaAtivaId && (
                            <button onClick={handleLimparEmpresa} className="filtro-limpar-btn">
                                Limpar filtro
                            </button>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

export default Filtrar;