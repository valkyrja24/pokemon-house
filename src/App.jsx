import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10; 

  useEffect(() => {
    document.title = "Pokémon Explorer";
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    } else {
      updateURL(1);
    }
  }, []);

  useEffect(() => {
    fetchPokemon(currentPage);
    updateURL(currentPage);
  }, [currentPage]);

  const fetchPokemon = async (page) => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      
      setTotalPages(Math.ceil(data.count / limit));
      
      const pokemonData = await Promise.all(
        data.results.map(async (pokemon) => {
          const detailResponse = await fetch(pokemon.url);
          return await detailResponse.json();
        })
      );
      
      setPokemonList(pokemonData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
      setLoading(false);
    }
  };

  const updateURL = (page) => {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.history.pushState({page}, '', url);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      } else {
        setCurrentPage(1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="pokemon-browser">
      <h1>Pokémon Explorer</h1>
      
      <div className="navigation-buttons">
        <button 
          onClick={handlePrevious} 
          disabled={currentPage === 1}
        >
          Back
        </button>
        <span className="pagination-text">Page {currentPage} of {totalPages}</span>
        <button 
          onClick={handleNext} 
          disabled={currentPage === totalPages}
        >
          Forward
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading Pokémon...</div>
      ) : (
        <div className="pokemon-grid">
          {pokemonList.map((pokemon) => (
            <div key={pokemon.id} className="pokemon-card">
              <img 
                src={pokemon.sprites.front_default} 
                alt={pokemon.name} 
              />
              <h3>{pokemon.name}</h3>
              <p>#{pokemon.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;