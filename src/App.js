import React, { useState } from 'react';
import {
  LayoutDashboard, Package, ChefHat, Settings as SettingsIcon, Menu, X
} from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Dashboard from './components/Dashboard';
import Ingredients from './components/Ingredients';
import Recipes from './components/Recipes';
import Settings from './components/Settings';

const PAGES = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { id: 'ingredients', label: 'Ingredientes', icon: Package },
  { id: 'recipes', label: 'Recetas', icon: ChefHat },
  { id: 'settings', label: 'Configuración', icon: SettingsIcon },
];

const PAGE_TITLES = {
  dashboard: 'Inicio',
  ingredients: 'Ingredientes',
  recipes: 'Recetas',
  settings: 'Configuración',
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ingredients, setIngredients] = useLocalStorage('dulce-ingredientes', []);
  const [recipes, setRecipes] = useLocalStorage('dulce-recetas', []);

  function navigate(pageId) {
    setPage(pageId);
    setSidebarOpen(false);
  }

  return (
    <div className="app">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>Dulce Costo</h1>
          <p>Repostería Artesanal</p>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section-label">Menú</div>
          {PAGES.map(p => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                className={`nav-item ${page === p.id ? 'active' : ''}`}
                onClick={() => navigate(p.id)}
              >
                <Icon size={18} />
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div>🧁 {ingredients.length} ingredientes · {recipes.length} recetas</div>
        </div>
      </nav>

      {/* Main */}
      <main className="main-content">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h2>{PAGE_TITLES[page]}</h2>
          <div style={{ width: 30 }} />
        </div>

        {/* Page header (desktop) */}
        {page !== 'ingredients' && page !== 'recipes' && page !== 'settings' && (
          <div className="page-header" style={{ display: 'none' }} />
        )}

        {/* Pages */}
        {page === 'dashboard' && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Resumen General</div>
                <div className="page-subtitle">Vista rápida de tu repostería</div>
              </div>
            </div>
            <Dashboard ingredients={ingredients} recipes={recipes} />
          </>
        )}

        {page === 'ingredients' && (
          <Ingredients ingredients={ingredients} setIngredients={setIngredients} />
        )}

        {page === 'recipes' && (
          <Recipes recipes={recipes} setRecipes={setRecipes} ingredients={ingredients} />
        )}

        {page === 'settings' && (
          <Settings
            ingredients={ingredients}
            recipes={recipes}
            setIngredients={setIngredients}
            setRecipes={setRecipes}
          />
        )}
      </main>
    </div>
  );
}
