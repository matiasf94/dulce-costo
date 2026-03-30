import React from 'react';
import { formatCLP, calculateRecipeCost, costPerBaseUnit, UNITS } from '../utils/calculations';

export default function Dashboard({ ingredients, recipes }) {
  const recipeStats = recipes.map(r => ({
    ...r,
    calc: calculateRecipeCost(r, ingredients),
  })).filter(r => r.calc);

  const totalRecetas = recipes.length;
  const totalIngredientes = ingredients.length;
  const avgMargen = recipeStats.length
    ? recipeStats.reduce((s, r) => s + r.calc.margen, 0) / recipeStats.length
    : 0;
  const recetaMasCara = recipeStats.reduce((max, r) => {
    return !max || r.calc.precioVentaConIVA > max.calc.precioVentaConIVA ? r : max;
  }, null);

  return (
    <div className="page-content">
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Recetas guardadas</div>
          <div className="stat-value">{totalRecetas}</div>
          <div className="stat-sub">recetas en tu libro</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ingredientes</div>
          <div className="stat-value">{totalIngredientes}</div>
          <div className="stat-sub">en tu despensa</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Margen promedio</div>
          <div className="stat-value">{avgMargen.toFixed(0)}%</div>
          <div className="stat-sub">ganancia sobre costo</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-label">Producto más caro</div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>
            {recetaMasCara ? formatCLP(recetaMasCara.calc.precioVentaConIVA) : '—'}
          </div>
          <div className="stat-sub">{recetaMasCara?.name || 'sin recetas'} / porción c/IVA</div>
        </div>
      </div>

      {/* Tabla resumen de recetas */}
      {recipeStats.length > 0 ? (
        <div className="card mb-24">
          <div className="card-title">Resumen de Recetas</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Receta</th>
                  <th>Porciones</th>
                  <th>Costo total</th>
                  <th>Costo / porción</th>
                  <th>Precio venta c/IVA</th>
                  <th>Margen</th>
                </tr>
              </thead>
              <tbody>
                {recipeStats.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td className="muted">{r.calc.porciones}</td>
                    <td className="mono">{formatCLP(r.calc.costoTotal)}</td>
                    <td className="mono highlight">{formatCLP(r.calc.costoPorcion)}</td>
                    <td className="mono" style={{ fontWeight: 600, color: 'var(--sage)' }}>
                      {formatCLP(r.calc.precioVentaConIVA)}
                    </td>
                    <td>
                      <span className="badge badge-caramel">{r.calc.margen}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🧁</div>
            <h3>¡Bienvenida a Dulce Costo!</h3>
            <p>Comienza agregando tus ingredientes y luego crea tus primeras recetas. Todos los precios y costos se calcularán automáticamente.</p>
          </div>
        </div>
      )}

      {/* Ingredientes con mayor costo */}
      {ingredients.length > 0 && (
        <div className="card">
          <div className="card-title">Ingredientes registrados</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Precio compra</th>
                  <th>Cantidad</th>
                  <th>Merma</th>
                  <th>Costo / unidad base</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.slice(0, 8).map(ing => {
                  const cpu = costPerBaseUnit(ing);
                  const unit = UNITS.find(u => u.value === ing.purchaseUnit);
                  return (
                    <tr key={ing.id}>
                      <td style={{ fontWeight: 500 }}>{ing.name}</td>
                      <td className="mono">{formatCLP(ing.purchasePrice)}</td>
                      <td className="muted">{ing.purchaseQty} {ing.purchaseUnit}</td>
                      <td className="muted">{ing.merma || 0}%</td>
                      <td className="mono highlight">
                        {formatCLP(cpu)} / {unit?.base || ing.purchaseUnit}
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
  );
}
