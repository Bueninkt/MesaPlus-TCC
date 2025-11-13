// 🔄 Arquivo: Filtrar.jsx
import React, { useState, useEffect } from 'react';
import './filtrar.css';
import seta from '../../assets/icons/seta.png';

function Filtrar({ onFilterChange }) {
  const [secaoAberta, setSecaoAberta] = useState(null);

  // --- Estados das listas ---
  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaEmpresas, setListaEmpresas] = useState([]); // 🆕 NOVO: Estado para guardar as empresas

  // --- Estados dos filtros ativos ---
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [dataVencimento, setDataVencimento] = useState('');
  const [empresaAtivaId, setEmpresaAtivaId] = useState(null); // 🔄 ALTERADO: De 'empresa' (string) para 'empresaAtivaId' (null ou number)

  // 🔄 1. EFEITO PARA CARREGAR DADOS (Categorias E Empresas)
  useEffect(() => {
    const buscarDadosIniciais = async () => {
      // Busca Categorias
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

      // 🆕 Busca Empresas
      try {
        // ❗️ Assumindo que seu endpoint de listagem de empresas é este
        const response = await fetch('http://localhost:8080/v1/mesa-plus/empresa');
        if (response.ok) {
          const data = await response.json();
          // ❗️ Ajuste 'data.empresas' se o nome da chave no JSON for outro
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
  }, []); // Roda só uma vez

  // 🔄 2. EFEITO ATUALIZADO (Comunica a mudança para o PAI)
  useEffect(() => {
    if (onFilterChange) {
      // ❗️ Note que agora estamos limpando o outro filtro
      // Se um filtro de empresa é ativado, o de categoria é 'ignorado' (enviado como null)
      // E vice-versa. Isso evita que o 'HomeUsuarioPage' se confunda.
      onFilterChange({
        categoriaId: empresaAtivaId ? null : categoriaAtiva, // Só envia categoria se empresa estiver limpa
        empresaId: categoriaAtiva ? null : empresaAtivaId, // Só envia empresa se categoria estiver limpa
        dataVencimento,
      });
    }
    // 🔄 'empresa' (string) foi trocado por 'empresaAtivaId'
  }, [categoriaAtiva, dataVencimento, empresaAtivaId, onFilterChange]);

  // Handler para alternar a visibilidade da seção
  const handleToggleSecao = (secao) => {
    setSecaoAberta(secaoAberta === secao ? null : secao);
  };

  // --- Handlers de Categoria ---
  const handleCategoriaChange = (event) => {
    const id = parseInt(event.target.value);
    setCategoriaAtiva(prevId => (prevId === id ? null : id));
    setEmpresaAtivaId(null); // 🆕 Limpa o filtro de empresa
  };

  const handleLimparCategoria = (e) => {
    e.stopPropagation();
    setCategoriaAtiva(null);
  };

  // --- 🆕 3. Handlers de Empresa (Novos) ---
  const handleEmpresaChange = (event) => {
    const id = parseInt(event.target.value);
    setEmpresaAtivaId(prevId => (prevId === id ? null : id));
    setCategoriaAtiva(null); // 🆕 Limpa o filtro de categoria
  };

  const handleLimparEmpresa = (e) => {
    e.stopPropagation();
    setEmpresaAtivaId(null);
  };


  return (
    <main className="filtrar-container">
      <h2 className="filtrar-titulo">Filtrar por:</h2>

      {/* Seção Categoria (sem mudanças na lógica interna) */}
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

      {/* Seção Data de Vencimento (sem mudanças) */}
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
            <input
              type="date"
              className="filtro-input-data"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* 🔄 4. Seção Empresas (Toda esta seção foi alterada) */}
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
            {/* 🆕 Mapeia a lista de empresas em vez de um input de texto */}
            {listaEmpresas.length > 0 ? (
              listaEmpresas.map((emp) => (
                <div key={emp.id} className="filtro-item">
                  <input
                    type="radio"
                    id={`emp-${emp.id}`}
                    name="empresa_filtro" // Grupo de rádio
                    value={emp.id}
                    checked={empresaAtivaId === emp.id} // Verifica se é o ID ativo
                    onChange={handleEmpresaChange} // Usa o novo handler
                  />
                  <label htmlFor={`emp-${emp.id}`}>{emp.nome}</label>
                </div>
              ))
            ) : (
              <p>Carregando empresas...</p>
            )}
            {/* 🆕 Botão de limpar para empresa */}
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