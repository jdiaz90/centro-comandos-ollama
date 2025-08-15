import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Genera un DOCX rellenando la plantilla de informe
 * @param {{fecha:string, nombre:string, texto:string, autor:string}} datos
 * @returns {Promise<string>} Ruta del DOCX generado
 */
export async function generarDOCXconPlantilla(datos) {
  const plantillaPath = path.join(__dirname, 'plantillas', 'informe.docx');
  const content = fs.readFileSync(plantillaPath, 'binary');
  
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true
  });

  doc.render({
    fecha: datos.fecha,
    nombre: datos.nombre,
    texto: datos.texto,
    autor: datos.autor
  });

  const buf = doc.getZip().generate({ type: 'nodebuffer' });

  const nombreArchivo = `${datos.nombre || 'informe'}.docx`.replace(/\s+/g, '_');
  const outPath = path.join(__dirname, 'output', nombreArchivo);
  fs.writeFileSync(outPath, buf);

  return outPath;
}
