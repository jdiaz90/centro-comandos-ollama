import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { generarDOCXconPlantilla } from './generarDOCXconPlantilla.js';
import { chatWithOllama } from './backend.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = process.env.TEMPLATE_DIR || 'plantillas';
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'output';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// -------------------- RUTA PRINCIPAL /chat --------------------
app.post('/chat', async (req, res) => {
  try {
    // chatWithOllama ahora devuelve directamente { intencion, datos } validado y parseado
    const { intencion, datos } = await chatWithOllama(req.body.mensaje);

    if (intencion === 'generar_informe') {
      const rutaArchivo = await generarDOCXconPlantilla(datos, TEMPLATE_DIR, OUTPUT_DIR);
      return res.download(rutaArchivo);
    }

    if (intencion === 'convertir_a_pdf') {
      return res.status(501).send('Conversión a PDF aún no implementada.');
    }

    if (intencion === 'enviar_correo') {
      return res.status(501).send('Envío de correo aún no implementado.');
    }

    return res.status(400).send('No se reconoce la intención del mensaje.');
  } catch (error) {
    console.error('Error procesando el mensaje:', error);
    res.status(500).send('Error interno');
  }
});

// -------------------- RUTA EXTRA /generar-doc --------------------
app.post('/generar-doc', async (req, res) => {
  try {
    const rutaArchivo = await generarDOCXconPlantilla(req.body, TEMPLATE_DIR, OUTPUT_DIR);
    res.download(rutaArchivo);
  } catch (error) {
    console.error('Error generando DOCX:', error);
    res.status(500).send('Error generando el documento');
  }
});

// -------------------- ARRANQUE DEL SERVIDOR --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en ${process.env.SERVER_URL || 'http://localhost:' + PORT}`);
});
