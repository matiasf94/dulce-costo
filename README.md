# 🧁 Dulce Costo — Calculadora de Repostería

App web para calcular costos de recetas de repostería, con IVA 19% (Chile).

## Funcionalidades

- **Ingredientes**: Registra precios de compra, cantidades y merma (pérdida)
- **Recetas**: Crea recetas con ingredientes, costos indirectos y margen de ganancia
- **Cálculo automático**: Costo por porción, precio de venta sin IVA y con IVA 19%
- **Costos indirectos**: Gas/electricidad, empaque, mano de obra y arriendo
- **Respaldo**: Exporta e importa tus datos en formato JSON
- **100% local**: Datos guardados en tu navegador (sin backend, sin suscripción)

## Tecnologías

- React 18
- localStorage para persistencia
- Lucide React (iconos)
- CSS puro con variables de diseño

## Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/dulce-costo.git
cd dulce-costo

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
```

## Deploy en Vercel

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
3. Importa el repositorio
4. Vercel detectará automáticamente que es un proyecto Create React App
5. Haz clic en **Deploy** — ¡listo!

## Estructura de datos

```
Ingrediente {
  name, category, brand
  purchasePrice (CLP),
  purchaseQty, purchaseUnit (kg/g/lt/ml/unidad)
  merma (%)
}

Receta {
  name, category, portions
  ingredients: [{ ingredientId, amount, unit }]
  gasPercent (%), packagingCost ($)
  laborHours, laborRate ($)
  arriendoPercent (%)
  margin (%)
  → costoTotal, costoPorcion
  → precioVentaNeto, precioVentaConIVA (19% IVA)
}
```

## IVA Chile

El cálculo considera IVA 19% según normativa chilena vigente.

- Precio neto × 1.19 = Precio con IVA
- Todos los precios de venta mostrados incluyen IVA

---

Hecho con 🧁 para reposteras y reposteros de Chile.
