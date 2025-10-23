import React, { useState, useEffect } from 'react';

import './filtrar.css';
import seta from '../../assets/icons/seta.png'; // Ajuste o caminho se necessário

// 1. NOME DO COMPONENTE: Começa com letra maiúscula
function filtrar({ onFilterChange }) { // 2. Recebe uma função 'onFilterChange' como prop
  const [secaoAberta, setSecaoAberta] = useState(null); // 'categoria', 'data', 'empresa' ou null

  // 3. ESTADO DOS FILTROS: Armazena os valores selecionados
  const [categorias, setCategorias] = useState({
    massas: false,
    laticinios: false,
    naoPerecivel: false, // IDs/names não devem ter espaços
    legumes: false,
    frutas: false,
  });
  const [dataVencimento, setDataVencimento] = useState('');
  const [empresa, setEmpresa] = useState('');

  // 4. EFEITO: Comunica as mudanças para o componente pai
  useEffect(() => {
    // Transforma o objeto de categorias em um array de strings ativas
    const categoriasAtivas = Object.keys(categorias).filter(
      (key) => categorias[key]
    );

    // Chama a função do componente pai sempre que um filtro mudar
    if (onFilterChange) {
      onFilterChange({
        categorias: categoriasAtivas,
        dataVencimento,
        empresa,
      });
    }
  }, [categorias, dataVencimento, empresa, onFilterChange]); // Array de dependências

  // Handler para alternar a visibilidade da seção
  const handleToggleSecao = (secao) => {
    setSecaoAberta(secaoAberta === secao ? null : secao);
  };

  // 5. HANDLERS: Funções para atualizar o estado dos filtros
  const handleCategoriaChange = (event) => {
    const { name, checked } = event.target;
    setCategorias((prevCategorias) => ({
      ...prevCategorias,
      [name]: checked,
    }));
  };

  return (
    <main className="filtrar-container">
      <h2 className="filtrar-titulo">Filtrar por:</h2>

      {/* Seção Categoria */}
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
            {/* 6. INPUTS CONTROLADOS: 'checked' e 'onChange' conectados ao estado */}
            <label htmlFor="massas">
              <input
                type="checkbox"
                id="massas"
                name="massas"
                checked={categorias.massas}
                onChange={handleCategoriaChange}
              /> Massas
            </label>
            <label htmlFor="laticinios">
              <input
                type="checkbox"
                id="laticinios"
                name="laticinios"
                checked={categorias.laticinios}
                onChange={handleCategoriaChange}
              /> Laticinios
            </label>
            <label htmlFor="naoPerecivel">
              <input
                type="checkbox"
                id="naoPerecivel"
                name="naoPerecivel"
                checked={categorias.naoPerecivel}
                onChange={handleCategoriaChange}
              /> Nao Perecivel
            </label>
            <label htmlFor="legumes">
              <input
                type="checkbox"
                id="legumes"
                name="legumes"
                checked={categorias.legumes}
                onChange={handleCategoriaChange}
              /> Legumes
            </label>
            <label htmlFor="frutas">
              <input
                type="checkbox"
                id="frutas"
                name="frutas"
                checked={categorias.frutas}
                onChange={handleCategoriaChange}
              /> Frutas
            </label>
          </div>
        )}
      </div>

      {/* Seção Data de Vencimento */}
      <div className="filtro-secao">
        <button className="filtro-barra" onClick={() => handleToggleSecao('data')}>
          <span>Data de Vencimento:</span>
          <img
            src={seta}
            alt="Abrir/Fechar"
            className={`filtro-seta ${secaoAberta === 'data' ? 'aberta' : ''}`}
          />
        </button>
        {secaoAberta === 'data' && (
          <div className="filtro-conteudo data">
            {/* 6. INPUTS CONTROLADOS: 'value' e 'onChange' conectados ao estado */}
            <input
              type="date"
              className="filtro-input-data"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Seção Empresas */}
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
            {/* 6. INPUTS CONTROLADOS: 'value' e 'onChange' conectados ao estado */}
            <input
              type="text"
              placeholder="Digite o nome da empresa..."
              className="filtro-input-texto"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
          </div>
        )}
      </div>
    </main>
  );
}

// 1. NOME DA EXPORTAÇÃO: Corresponde ao componente
export default filtrar;