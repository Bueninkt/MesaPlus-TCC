import React, { useState, useEffect } from 'react';
import './filtrar.css';
import seta from '../../assets/icons/seta.png'; // Ajuste o caminho se necessário

// ❗️ Renomeie seu arquivo/componente para 'Filtrar' (com F maiúsculo)
// para seguir o padrão do React
function Filtrar({ onFilterChange }) { 
  const [secaoAberta, setSecaoAberta] = useState(null);
  const [listaCategorias, setListaCategorias] = useState([]);
  
  // 🆕 1. ESTADO MUDADO
  // Trocamos o objeto 'categoriasSelecionadas' por um ID único ou null
  const [categoriaAtiva, setCategoriaAtiva] = useState(null); 
  
  const [dataVencimento, setDataVencimento] = useState('');
  const [empresa, setEmpresa] = useState('');

  // 🆕 2. EFEITO PARA CARREGAR CATEGORIAS (Otimizado)
  useEffect(() => {
    const buscarCategorias = async () => {
      try {
        const response = await fetch('http://localhost:8080/v1/mesa-plus/categoria');
        
        if (!response.ok) {
          console.error(`Erro ao buscar categorias: ${response.status}`);
          return; 
        }

        const data = await response.json();
        
        if (data.status && data.categorias) {
          setListaCategorias(data.categorias);
          // Não precisamos mais inicializar o estado de 'categoriasSelecionadas'
        } else {
          console.error("Formato de resposta da API inesperado.", data);
        }
      } catch (error) {
        console.error('Erro de rede ao buscar categorias:', error);
      }
    };

    buscarCategorias();
  }, []); // Roda só uma vez

  // 🆕 3. EFEITO ATUALIZADO (Comunica a mudança para o PAI)
  // Este useEffect agora é 'seguro' e não causará loops
  // desde que 'onFilterChange' seja memorizado no componente pai (HomeUsuarioPage)
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        categoriaId: categoriaAtiva, // Envia o ID ativo (ou null)
        dataVencimento,
        empresa,
      });
    }
  }, [categoriaAtiva, dataVencimento, empresa, onFilterChange]);

  // Handler para alternar a visibilidade da seção
  const handleToggleSecao = (secao) => {
    setSecaoAberta(secaoAberta === secao ? null : secao);
  };

  // 🆕 4. HANDLER ATUALIZADO (Lógica para 'radio button')
  const handleCategoriaChange = (event) => {
    const id = parseInt(event.target.value);
    
    // Se clicar no rádio que já está marcado, ele desmarca (seta para null)
    // Se clicar em um rádio diferente, ele marca o novo
    setCategoriaAtiva(prevId => (prevId === id ? null : id));
  };

  // 🆕 5. HANDLER NOVO (Para limpar o filtro de rádio)
  const handleLimparFiltro = (e) => {
    e.stopPropagation(); // Impede o 'handleToggleSecao' de fechar a aba
    setCategoriaAtiva(null);
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
            {listaCategorias.length > 0 ? (
              listaCategorias.map((cat) => (
                <div key={cat.id} className="filtro-item">
                  
                  {/* 🆕 6. MUDANÇA DE CHECKBOX PARA RADIO */}
                  <input
                    type="radio" // <-- MUDOU
                    id={`cat-${cat.id}`}
                    name="categoria_filtro" // <-- Todos os rádios no mesmo grupo
                    value={cat.id}
                    checked={categoriaAtiva === cat.id} // <-- Verifica se este rádio é o ativo
                    onChange={handleCategoriaChange}
                  />
                  <label htmlFor={`cat-${cat.id}`}>{cat.nome}</label>
                </div>
              ))
            ) : (
              <p>Carregando categorias...</p>
            )}
            
            {/* 🆕 7. BOTÃO PARA LIMPAR (só aparece se um filtro estiver ativo) */}
            {categoriaAtiva && (
                 <button onClick={handleLimparFiltro} className="filtro-limpar-btn">
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

      {/* Seção Empresas (sem mudanças) */}
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

export default Filtrar;