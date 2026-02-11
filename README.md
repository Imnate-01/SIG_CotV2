# SIG Cotizaciones - Guía de Ejecución Local

Para probar la aplicación en tu entorno local, sigue estos pasos:

## Prerrequisitos
- Node.js instalado (versión 18+ recomendada)
- Una instancia de Supabase (o conexión a base de datos PostgreSQL)
- Una API Key de Google Gemini

## 1. Configuración del Backend

1.  Navega a la carpeta `backend`:
    ```bash
    cd backend
    ```
2.  Asegúrate de tener un archivo `.env` con las siguientes variables:
    ```env
    PORT=3001
    DATABASE_URL=tu_conexion_supabase_o_postgres
    GEMINI_API_KEY=tu_api_key_de_google
    JWT_SECRET=tu_secreto_para_tokens
    ```
3.  Instala las dependencias (si no lo has hecho):
    ```bash
    npm install
    ```
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    *El backend correrá en `http://localhost:3001`*

## 2. Configuración del Frontend

1.  Abre una **nueva terminal** y navega a la carpeta `frontend`:
    ```bash
    cd frontend
    ```
2.  Asegúrate de tener las variables de entorno configuradas (ej. `.env.local`):
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:3001/api
    ```
3.  Instala dependencias:
    ```bash
    npm install
    ```
4.  Inicia la aplicación Next.js:
    ```bash
    npm run dev
    ```
    *El frontend correrá en `http://localhost:3000`*

## 3. Probando la Predicción
1.  Abre tu navegador en `http://localhost:3000`.
2.  Inicia sesión en la aplicación.
3.  Ve a la sección **Reportes**.
4.  Verás la nueva tarjeta de "Análisis Predictivo IA" y las barras de pronóstico en la gráfica principal.
