import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package } from 'lucide-react';
import { UNITS, costPerBaseUnit, formatCLP, generateId } from '../utils/calculations';

const emptyIngredient = {
  name: '',
  category: '',
  purchasePrice: '',
  purchaseQty: '',
  purchaseUnit: 'kg',
  merma: '',
  brand: '',
  notes: '',
};

const CATEGORIES = ['Lácteos', 'Harinas y cereales', 'Azúcares', 'Huevos', 'Chocolates', 'Frutas', 'Frutos secos', 'Empaques', 'Grasas y aceites', 'Saborizantes', 'Leudantes', 'Otro'];

export default function Ingredients({ ingredients, setIngredients }) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyIngredient);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = ingredients.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.category && i.category.toLowerCase().includes(search.toLowerCase()))
  );

  function openNew() {
    setEditing(null);
    setForm(emptyIngredient);
    setModalOpen(true);
  }

  function openEdit(ing) {
    setEditing(ing.id);
    setForm({ ...ing });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyIngredient);
  }

  function handleSave() {
    if (!form.name.trim() || !form.purchasePrice || !form.purchaseQty) return;
    const entry = {
      ...form,
      purchasePrice: parseFloat(form.purchasePrice),
      purchaseQty: parseFloat(form.purchaseQty),
      merma: parseFloat(form.merma) || 0,
    };
    if (editing) {
      setIngredients(prev => prev.map(i => i.id === editing ? { ...entry, id: editing } : i));
    } else {
      setIngredients(prev => [...prev, { ...entry, id: generateId() }]);
    }
    closeModal();
  }

  function handleDelete(id) {
    setIngredients(prev => prev.filter(i => i.id !== id));
    setDeleteConfirm(null);
  }

  function field(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Ingredientes</div>
          <div className="page-subtitle">Gestiona tu despensa y precios de compra</div>
        </div>
        <div className="flex gap-8">
          <div className="search-bar">
            <Search size={15} color="var(--text-muted)" />
            <input
              placeholder="Buscar ingrediente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>

      <div className="page-content">
        {filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><Package size={48} /></div>
              <h3>{search ? 'Sin resultados' : 'Sin ingredientes'}</h3>
              <p>{search ? 'Prueba otra búsqueda.' : 'Agrega tus primeros ingredientes con sus precios de compra para comenzar a calcular recetas.'}</p>
              {!search && <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Agregar ingrediente</button>}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ingrediente</th>
                    <th>Categoría</th>
                    <th>Precio compra</th>
                    <th>Cantidad</th>
                    <th>Merma</th>
                    <th>Costo / base</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ing => {
                    const cpu = costPerBaseUnit(ing);
                    const unit = UNITS.find(u => u.value === ing.purchaseUnit);
                    return (
                      <tr key={ing.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{ing.name}</div>
                          {ing.brand && <div className="text-xs text-muted">{ing.brand}</div>}
                        </td>
                        <td>
                          {ing.category ? (
                            <span className="badge badge-caramel">{ing.category}</span>
                          ) : <span className="muted">—</span>}
                        </td>
                        <td className="mono">{formatCLP(ing.purchasePrice)}</td>
                        <td className="muted">{ing.purchaseQty} {ing.purchaseUnit}</td>
                        <td className="muted">{ing.merma || 0}%</td>
                        <td className="mono highlight">
                          {formatCLP(cpu)} / {unit?.base || ing.purchaseUnit}
                        </td>
                        <td>
                          <div className="flex gap-8">
                            <button className="btn-icon" onClick={() => openEdit(ing)} title="Editar">
                              <Edit2 size={14} />
                            </button>
                            <button className="btn-icon" onClick={() => setDeleteConfirm(ing.id)} title="Eliminar"
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

      {/* Modal ingrediente */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</div>
              <button className="btn-icon" onClick={closeModal}><X size={18} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del ingrediente *</label>
              <input className="form-input" placeholder="Ej: Harina sin polvos" value={form.name} onChange={e => field('name', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select className="form-select" value={form.category} onChange={e => field('category', e.target.value)}>
                  <option value="">Sin categoría</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Marca / Proveedor</label>
                <input className="form-input" placeholder="Opcional" value={form.brand} onChange={e => field('brand', e.target.value)} />
              </div>
            </div>

            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Datos de compra
              </div>
              <div className="form-row-3">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Precio de compra ($) *</label>
                  <input className="form-input" type="number" placeholder="2500" value={form.purchasePrice} onChange={e => field('purchasePrice', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cantidad *</label>
                  <input className="form-input" type="number" placeholder="1" value={form.purchaseQty} onChange={e => field('purchaseQty', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Unidad</label>
                  <select className="form-select" value={form.purchaseUnit} onChange={e => field('purchaseUnit', e.target.value)}>
                    {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Merma / Pérdida (%)</label>
              <input className="form-input" type="number" min="0" max="100" placeholder="0 — sin merma"
                value={form.merma} onChange={e => field('merma', e.target.value)} />
              <div className="text-xs text-muted mt-8">
                Pérdida al pelar, limpiar o procesar. Ejemplo: 15% para frutas con cáscara.
              </div>
            </div>

            {/* Preview costo */}
            {form.purchasePrice && form.purchaseQty && (
              <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div className="text-xs text-muted">Costo por {UNITS.find(u => u.value === form.purchaseUnit)?.base}</div>
                  <div style={{ fontWeight: 600, color: 'var(--caramel-dark)' }}>
                    {formatCLP(costPerBaseUnit({
                      purchasePrice: parseFloat(form.purchasePrice),
                      purchaseQty: parseFloat(form.purchaseQty),
                      purchaseUnit: form.purchaseUnit,
                      merma: parseFloat(form.merma) || 0,
                    }))}
                  </div>
                </div>
                {form.merma > 0 && (
                  <div>
                    <div className="text-xs text-muted">Con {form.merma}% merma aplicada</div>
                    <div style={{ fontWeight: 500, color: 'var(--rose)', fontSize: '0.85rem' }}>
                      {(100 - parseFloat(form.merma)).toFixed(0)}% rendimiento
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notas</label>
              <input className="form-input" placeholder="Opcional" value={form.notes} onChange={e => field('notes', e.target.value)} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}
                disabled={!form.name.trim() || !form.purchasePrice || !form.purchaseQty}>
                {editing ? 'Guardar cambios' : 'Agregar ingrediente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ marginBottom: 12 }}>¿Eliminar ingrediente?</div>
            <p className="text-sm text-muted">Este ingrediente se eliminará de tu lista. Si está en una receta, esa línea quedará sin calcular.</p>
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
