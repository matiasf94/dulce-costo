import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Eye, ChefHat } from 'lucide-react';
import {
  RECIPE_UNITS, calculateRecipeCost, ingredientLineCost,
  formatCLP, generateId, IVA
} from '../utils/calculations';

const emptyRecipe = {
  name: '',
  category: '',
  portions: 1,
  portionDescription: '',
  ingredients: [],
  gasPercent: 5,
  packagingCost: 0,
  laborHours: 0,
  laborRate: 0,
  arriendoPercent: 0,
  margin: 80,
  notes: '',
};

const RECIPE_CATEGORIES = ['Tortas', 'Cupcakes', 'Galletas', 'Tartas', 'Macarons', 'Panes', 'Postres', 'Trufas', 'Otro'];

function RecipeModal({ recipe, ingredients, onSave, onClose }) {
  const [form, setForm] = useState(recipe || emptyRecipe);

  function field(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function addIngredient() {
    field('ingredients', [...form.ingredients, { id: generateId(), ingredientId: '', amount: '', unit: 'g' }]);
  }

  function updateIngredient(idx, key, value) {
    const updated = form.ingredients.map((ri, i) => i === idx ? { ...ri, [key]: value } : ri);
    field('ingredients', updated);
  }

  function removeIngredient(idx) {
    field('ingredients', form.ingredients.filter((_, i) => i !== idx));
  }

  const calc = calculateRecipeCost(
    {
      ...form,
      portions: parseInt(form.portions) || 1,
      gasPercent: parseFloat(form.gasPercent) || 0,
      packagingCost: parseFloat(form.packagingCost) || 0,
      laborHours: parseFloat(form.laborHours) || 0,
      laborRate: parseFloat(form.laborRate) || 0,
      arriendoPercent: parseFloat(form.arriendoPercent) || 0,
      margin: parseFloat(form.margin) || 0,
      ingredients: form.ingredients.map(ri => ({
        ...ri,
        amount: parseFloat(ri.amount) || 0,
      })),
    },
    ingredients
  );

  function handleSave() {
    if (!form.name.trim()) return;
    onSave({
      ...form,
      portions: parseInt(form.portions) || 1,
      gasPercent: parseFloat(form.gasPercent) || 0,
      packagingCost: parseFloat(form.packagingCost) || 0,
      laborHours: parseFloat(form.laborHours) || 0,
      laborRate: parseFloat(form.laborRate) || 0,
      arriendoPercent: parseFloat(form.arriendoPercent) || 0,
      margin: parseFloat(form.margin) || 0,
      ingredients: form.ingredients.map(ri => ({
        ...ri,
        amount: parseFloat(ri.amount) || 0,
      })),
    });
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{recipe ? 'Editar Receta' : 'Nueva Receta'}</div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
            <label className="form-label">Nombre de la receta *</label>
            <input className="form-input" placeholder="Ej: Torta de Chocolate Húmeda" value={form.name} onChange={e => field('name', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Categoría</label>
            <select className="form-select" value={form.category} onChange={e => field('category', e.target.value)}>
              <option value="">Sin categoría</option>
              {RECIPE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Porciones / unidades que produce *</label>
            <input className="form-input" type="number" min="1" value={form.portions} onChange={e => field('portions', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
            <label className="form-label">Descripción de porción</label>
            <input className="form-input" placeholder="Ej: 1 torta de 24cm, o 12 cupcakes" value={form.portionDescription} onChange={e => field('portionDescription', e.target.value)} />
          </div>
        </div>

        {/* Ingredientes */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ingredientes de la receta
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addIngredient}>
              <Plus size={13} /> Agregar
            </button>
          </div>

          {form.ingredients.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Sin ingredientes. Agrega los que usa esta receta.
            </div>
          )}

          {form.ingredients.map((ri, idx) => {
            const ing = ingredients.find(i => i.id === ri.ingredientId);
            const lineCost = ing && ri.amount
              ? ingredientLineCost({ ...ri, amount: parseFloat(ri.amount) || 0 }, ingredients)
              : null;

            return (
              <div key={ri.id} className="ingredient-row">
                <div>
                  <select className="form-select" value={ri.ingredientId}
                    onChange={e => updateIngredient(idx, 'ingredientId', e.target.value)}
                    style={{ fontSize: '0.85rem' }}>
                    <option value="">— Seleccionar ingrediente —</option>
                    {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <input className="form-input" type="number" placeholder="0" value={ri.amount}
                    onChange={e => updateIngredient(idx, 'amount', e.target.value)}
                    style={{ fontSize: '0.85rem' }} />
                </div>
                <div>
                  <select className="form-select" value={ri.unit}
                    onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                    style={{ fontSize: '0.85rem' }}>
                    {RECIPE_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {lineCost !== null && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--caramel-dark)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {formatCLP(lineCost)}
                    </span>
                  )}
                  <button className="btn-icon btn-sm" onClick={() => removeIngredient(idx)}
                    style={{ borderColor: 'var(--rose-light)', color: 'var(--rose)' }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Costos indirectos */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Costos indirectos
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Gas / Electricidad (%)</label>
              <input className="form-input" type="number" min="0" placeholder="5" value={form.gasPercent}
                onChange={e => field('gasPercent', e.target.value)} />
              <div className="text-xs text-muted mt-8">% sobre costo de materia prima</div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Empaque / Packaging ($)</label>
              <input className="form-input" type="number" min="0" placeholder="0" value={form.packagingCost}
                onChange={e => field('packagingCost', e.target.value)} />
              <div className="text-xs text-muted mt-8">Costo total de empaques</div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mano de obra (horas)</label>
              <input className="form-input" type="number" min="0" step="0.5" placeholder="0" value={form.laborHours}
                onChange={e => field('laborHours', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Valor hora mano de obra ($)</label>
              <input className="form-input" type="number" min="0" placeholder="5000" value={form.laborRate}
                onChange={e => field('laborRate', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
              <label className="form-label">Arriendo / Espacio (%)</label>
              <input className="form-input" type="number" min="0" placeholder="0" value={form.arriendoPercent}
                onChange={e => field('arriendoPercent', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Margen */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Margen de ganancia (%)</label>
            <input className="form-input" type="number" min="0" value={form.margin}
              onChange={e => field('margin', e.target.value)} />
            <div className="text-xs text-muted mt-8">% sobre el costo total</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Notas de la receta</label>
            <input className="form-input" placeholder="Observaciones..." value={form.notes}
              onChange={e => field('notes', e.target.value)} />
          </div>
        </div>

        {/* Costo preview */}
        {calc && (
          <div className="cost-box" style={{ marginBottom: '8px' }}>
            <div style={{ fontFamily: 'var(--font-display)', color: 'var(--caramel-light)', fontSize: '0.9rem', marginBottom: '12px', fontWeight: 700 }}>
              Resumen de costos
            </div>
            <div className="cost-box-row">
              <span>Materia prima</span>
              <span>{formatCLP(calc.materiaPrima)}</span>
            </div>
            {calc.gasElec > 0 && <div className="cost-box-row"><span>Gas / Electricidad</span><span>{formatCLP(calc.gasElec)}</span></div>}
            {calc.packaging > 0 && <div className="cost-box-row"><span>Empaque</span><span>{formatCLP(calc.packaging)}</span></div>}
            {calc.manoObra > 0 && <div className="cost-box-row"><span>Mano de obra</span><span>{formatCLP(calc.manoObra)}</span></div>}
            {calc.arriendo > 0 && <div className="cost-box-row"><span>Arriendo</span><span>{formatCLP(calc.arriendo)}</span></div>}
            <div className="cost-box-row" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '4px', paddingTop: '10px' }}>
              <span>Costo total receta</span>
              <span>{formatCLP(calc.costoTotal)}</span>
            </div>
            <div className="cost-box-row">
              <span>Costo por porción</span>
              <span>{formatCLP(calc.costoPorcion)}</span>
            </div>
            <div className="cost-box-row">
              <span>Precio venta s/IVA</span>
              <span>{formatCLP(calc.precioVentaNeto)}</span>
            </div>
            <div className="cost-box-row">
              <span>IVA 19%</span>
              <span>{formatCLP(calc.ivaAmount)}</span>
            </div>
            <div className="cost-box-row total">
              <span style={{ color: 'white', fontWeight: 700 }}>💰 Precio venta c/IVA</span>
              <span style={{ fontSize: '1.3rem' }}>{formatCLP(calc.precioVentaConIVA)}</span>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!form.name.trim()}>
            {recipe ? 'Guardar cambios' : 'Crear receta'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecipeDetail({ recipe, ingredients, onClose, onEdit }) {
  const calc = calculateRecipeCost(recipe, ingredients);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-title">{recipe.name}</div>
            {recipe.category && <span className="badge badge-caramel" style={{ marginTop: '6px' }}>{recipe.category}</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={onEdit}><Edit2 size={14} /> Editar</button>
            <button className="btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        {recipe.portionDescription && (
          <div className="text-sm text-muted mb-16">{recipe.portionDescription}</div>
        )}

        {/* Ingredientes */}
        <div className="card mb-16">
          <div className="card-title">Ingredientes</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Costo línea</th>
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients.map(ri => {
                  const ing = ingredients.find(i => i.id === ri.ingredientId);
                  const cost = ingredientLineCost(ri, ingredients);
                  return (
                    <tr key={ri.id}>
                      <td style={{ fontWeight: 500 }}>{ing?.name || <span style={{ color: 'var(--rose)' }}>Ingrediente eliminado</span>}</td>
                      <td className="muted">{ri.amount}</td>
                      <td className="muted">{ri.unit}</td>
                      <td className="mono highlight">{formatCLP(cost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {calc && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="cost-box">
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--caramel-light)', marginBottom: '12px', fontWeight: 700 }}>
                Desglose de costos
              </div>
              <div className="cost-box-row"><span>Materia prima</span><span>{formatCLP(calc.materiaPrima)}</span></div>
              {calc.gasElec > 0 && <div className="cost-box-row"><span>Gas / Elec</span><span>{formatCLP(calc.gasElec)}</span></div>}
              {calc.packaging > 0 && <div className="cost-box-row"><span>Empaque</span><span>{formatCLP(calc.packaging)}</span></div>}
              {calc.manoObra > 0 && <div className="cost-box-row"><span>Mano de obra</span><span>{formatCLP(calc.manoObra)}</span></div>}
              {calc.arriendo > 0 && <div className="cost-box-row"><span>Arriendo</span><span>{formatCLP(calc.arriendo)}</span></div>}
              <div className="cost-box-row total"><span>Costo total</span><span>{formatCLP(calc.costoTotal)}</span></div>
            </div>

            <div className="cost-box">
              <div style={{ fontFamily: 'var(--font-display)', color: 'var(--caramel-light)', marginBottom: '12px', fontWeight: 700 }}>
                Precio de venta
              </div>
              <div className="cost-box-row"><span>Porciones</span><span>{calc.porciones}</span></div>
              <div className="cost-box-row"><span>Costo / porción</span><span>{formatCLP(calc.costoPorcion)}</span></div>
              <div className="cost-box-row"><span>Margen ({calc.margen}%)</span><span>{formatCLP(calc.precioVentaNeto - calc.costoPorcion)}</span></div>
              <div className="cost-box-row"><span>Precio s/IVA</span><span>{formatCLP(calc.precioVentaNeto)}</span></div>
              <div className="cost-box-row"><span>IVA 19%</span><span>{formatCLP(calc.ivaAmount)}</span></div>
              <div className="cost-box-row total"><span>💰 Precio c/IVA</span><span>{formatCLP(calc.precioVentaConIVA)}</span></div>
            </div>
          </div>
        )}

        {recipe.notes && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            📝 {recipe.notes}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Recipes({ recipes, setRecipes, ingredients }) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.category && r.category.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSave(data) {
    if (editing) {
      setRecipes(prev => prev.map(r => r.id === editing.id ? { ...data, id: editing.id } : r));
    } else {
      setRecipes(prev => [...prev, { ...data, id: generateId() }]);
    }
    setModalOpen(false);
    setEditing(null);
  }

  function openEdit(recipe) {
    setDetailOpen(null);
    setEditing(recipe);
    setModalOpen(true);
  }

  function handleDelete(id) {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setDeleteConfirm(null);
    setDetailOpen(null);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Recetas</div>
          <div className="page-subtitle">Crea y gestiona tus recetas con cálculo automático de costos</div>
        </div>
        <div className="flex gap-8">
          <div className="search-bar">
            <Search size={15} color="var(--text-muted)" />
            <input placeholder="Buscar receta..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={16} /> Nueva receta
          </button>
        </div>
      </div>

      <div className="page-content">
        {filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><ChefHat size={48} /></div>
              <h3>{search ? 'Sin resultados' : 'Sin recetas'}</h3>
              <p>{ingredients.length === 0
                ? 'Primero agrega ingredientes en la sección Ingredientes, luego crea tus recetas.'
                : 'Crea tu primera receta y calcula automáticamente el precio de venta con IVA.'
              }</p>
              {!search && <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Nueva receta</button>}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Receta</th>
                    <th>Categoría</th>
                    <th>Porciones</th>
                    <th>Costo total</th>
                    <th>Costo / porción</th>
                    <th>Precio c/IVA</th>
                    <th>Margen</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const calc = calculateRecipeCost(r, ingredients);
                    return (
                      <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setDetailOpen(r)}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{r.name}</div>
                          {r.portionDescription && <div className="text-xs text-muted">{r.portionDescription}</div>}
                        </td>
                        <td>{r.category ? <span className="badge badge-caramel">{r.category}</span> : <span className="muted">—</span>}</td>
                        <td className="muted">{r.portions}</td>
                        <td className="mono">{calc ? formatCLP(calc.costoTotal) : '—'}</td>
                        <td className="mono highlight">{calc ? formatCLP(calc.costoPorcion) : '—'}</td>
                        <td className="mono" style={{ fontWeight: 600, color: 'var(--sage)' }}>
                          {calc ? formatCLP(calc.precioVentaConIVA) : '—'}
                        </td>
                        <td>{calc ? <span className="badge badge-sage">{r.margin}%</span> : '—'}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="flex gap-8">
                            <button className="btn-icon" onClick={() => setDetailOpen(r)} title="Ver detalle"><Eye size={14} /></button>
                            <button className="btn-icon" onClick={() => openEdit(r)} title="Editar"><Edit2 size={14} /></button>
                            <button className="btn-icon" onClick={() => setDeleteConfirm(r.id)} title="Eliminar"
                              style={{ borderColor: 'var(--rose-light)', color: 'var(--rose)' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <RecipeModal
          recipe={editing}
          ingredients={ingredients}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}

      {detailOpen && (
        <RecipeDetail
          recipe={detailOpen}
          ingredients={ingredients}
          onClose={() => setDetailOpen(null)}
          onEdit={() => openEdit(detailOpen)}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ marginBottom: 12 }}>¿Eliminar receta?</div>
            <p className="text-sm text-muted">Esta acción no se puede deshacer.</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
