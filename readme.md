# Ollama Orquestador

Plataforma **Node.js + Express** que integra con **Ollama** para procesar mensajes en lenguaje natural y decidir qué acción ejecutar en el servidor.  
Actualmente implementa la generación de **informes DOCX** desde una plantilla, pero está diseñada para crecer con nuevas funciones como conversión a PDF, envío de correos o cualquier otra tarea definida.

## ?? Características
- Recibe mensajes en el endpoint `/chat` y delega en Ollama la detección de intención.
- Ejecuta la acción correspondiente según la intención detectada.
- **Acción disponible**: Generación automática de informes DOCX desde plantillas (`plantillas/informe.docx`) con los campos:
  - **`fecha`** → Fecha en formato `DD-MM-YYYY`.
  - **`nombre`** → Nombre del informe, proyecto o destinatario.
  - **`texto`** → Cuerpo del informe; puede contener `\n\n` para separar p��rrafos.
  - **`autor`** → Nombre del autor o firmante.
- Carpeta `output` donde se guardan los documentos generados.
- Configuración mediante variables de entorno `.env`.

## ?? Requisitos
- Node.js 18+
- Ollama instalado y corriendo localmente (`OLLAMA_HOST`)
- Dependencias: instalar con `npm install`

## 📌 Variables de entorno (`.env`)
```env
PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral
TEMPLATE_DIR=plantillas
OUTPUT_DIR=output
SERVER_URL=http://localhost:3000```

##▶️ Uso
1. Inicia Ollama en tu máquina.
2. Instala dependencias:
	npm install
3. Arranca el servidor:
	npm start
4. Envía una petición POST a /chat mediante el chat. El servidor devolverá un archivo DOCX listo para descargar.

##📜 Licencia
MIT