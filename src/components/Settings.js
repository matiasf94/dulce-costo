import React, { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { IVA } from '../utils/calculations';

export default function Settings({ ingredients, recipes, setIngredients, setRecipes }) {
  const [resetConfirm, setResetConfirm] = useState(false);

  function exportData() {
    const data = { ingredients, recipes, exportedAt: new Date().toISOString(), version: '1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dulce-costo-backup-${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.recipes) setRecipes(data.recipes);
        alert('✅ Datos importados correctamente');
      } catch {
        alert('❌ Error al leer el archivo. Asegúrate de que sea un backup válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function resetAll() {
    setIngredients([]);
    setRecipes([]);
    setResetConfirm(false);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Configuración</div>
          <div className="page-subtitle">Ajustes generales y respaldo de datos</div>
        </div>
      </div>

      <div className="page-content">
        {/* Info IVA */}
        <div className="card mb-24">
          <div className="card-title">Configuración de IVA</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '2rem' }}>🇨🇱</div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--chocolate)' }}>IVA Chile: 19%</div>
              <div className="text-sm text-muted">El IVA está configurado según la normativa chilena vigente (19%). Todos los precios de venta mostrados incluyen este impuesto.</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div className="text-xs text-muted">Factor IVA</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1.1rem', color: 'var(--caramel-dark)' }}>× {(1 + IVA).toFixed(2)}</div>
            </div>
          </div>
          <div className="text-xs text-muted" style={{ marginTop: '12px' }}>
            Ejemplo: Precio neto $1.000 → IVA $190 → <strong>Precio final $1.190</strong>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="card mb-24">
          <div className="card-title">Resumen de datos</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--caramel)' }}>{ingredients.length}</div>
              <div className="text-sm text-muted">Ingredientes</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--caramel)' }}>{recipes.length}</div>
              <div className="text-sm text-muted">Recetas</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--sage)' }}>💾</div>
              <div className="text-sm text-muted">Local (tu dispositivo)</div>
            </div>
          </div>
          <div className="text-xs text-muted" style={{ marginTop: '12px' }}>
            Los datos se guardan en tu navegador (localStorage). Para no perderlos, haz respaldo periódico.
          </div>
        </div>

        {/* Backup */}
        <div className="card mb-24">
          <div className="card-title">Respaldo de datos</div>
          <p className="text-sm text-muted mb-16">
            Exporta todos tus ingredientes y recetas a un archivo JSON. Puedes importarlo después en cualquier dispositivo.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={exportData}>
              <Download size={16} /> Exportar backup (.json)
            </button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} /> Importar backup
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
            </label>
          </div>
        </div>

        {/* Peligro */}
        <div className="card" style={{ borderColor: 'var(--rose-light)' }}>
          <div className="card-title" style={{ color: 'var(--rose)' }}>Zona de peligro</div>
          <p className="text-sm text-muted mb-16">
            Eliminar todos los datos es irreversible. Asegúrate de exportar un backup antes.
          </p>
          <button className="btn btn-danger" onClick={() => setResetConfirm(true)}>
            <Trash2 size={16} /> Eliminar todos los datos
          </button>
        </div>
      </div>

      {resetConfirm && (
        <div className="modal-overlay" onClick={() => setResetConfirm(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <AlertTriangle size={24} color="var(--rose)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div className="modal-title">¿Eliminar todos los datos?</div>
                <p className="text-sm text-muted" style={{ marginTop: '8px' }}>
                  Se borrarán <strong>{ingredients.length} ingredientes</strong> y <strong>{recipes.length} recetas</strong>. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setResetConfirm(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={resetAll}>Sí, eliminar todo</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
