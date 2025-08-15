// backend.js
import fetch from 'node-fetch'; // En Node 18+ puedes usar globalThis.fetch y eliminar esta import
import { verificarOllamaDisponible } from './verificarOllamaDisponible.js';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

/**
 * Hace la llamada HTTP real al servidor Ollama
 * @param {string} prompt - Prompt completo que se le enviará al modelo
 * @returns {Promise<string>} - Texto generado por el modelo
 */
export async function llamarAOllama(prompt) {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama3', // usa tu modelo aquí
      prompt: prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al llamar a Ollama`);
  }

  const data = await response.json();
  return data.response;
}

/**
 * Orquesta: prepara el prompt, verifica Ollama, llama, limpia y parsea JSON
 */
export async function chatWithOllama(mensaje) {
  const anioActual = new Date().getFullYear();

const prompt = `
Responde en español.

Recibes un mensaje del usuario.

Tarea:
1. Detectar la intención: "generar_informe", "convertir_a_pdf", "enviar_correo" o "otra".
2. Si la intención es "generar_informe", genera un único objeto JSON con:
   - "fecha": DD-MM-YYYY
   - "nombre": cadena
   - "texto": cadena. Si contiene instrucciones (p. ej. "redacta...", "escribe...", "incluye...", "añade..."), interprétalas y produce el contenido final, redactado y con la extensión/formato pedidos. Si hay contenido literal más instrucciones, copia el literal al inicio (sin puntos suspensivos finales si los hubiera) y añade lo nuevo solicitado. Si se indica o infiere un nº de párrafos, respétalo y sepáralos con doble salto de línea (\\n\\n). Nunca devuelvas frases de instrucción sin desarrollar.
   - "autor": cadena
3. Si la intención no es "generar_informe", "datos" será {}.

Reglas estrictas:
- Devuelve solo un objeto JSON válido (RFC 8259), sin explicaciones ni texto fuera de él.
- Claves y cadenas entre comillas dobles, sin comas finales.
- Escapa saltos de línea como \\n y comillas como \\" dentro de cadenas.
- Orden de claves: "intencion" primero, luego "datos".
- Si el mensaje ya incluye "fecha", "nombre", "texto" y "autor", úsalos tal cual, sin modificarlos, traducirlos ni inventar valores.

Estructura exacta de salida:
{
  "intencion": "valor_en_minusculas_sin_tildes",
  "datos": {
    "fecha": "DD-MM-YYYY",
    "nombre": "cadena",
    "texto": "cadena",
    "autor": "cadena"
  }
}

Mensaje: """${mensaje}"""

`;

  // 1️⃣ Verificar disponibilidad de Ollama
  const disponible = await verificarOllamaDisponible(OLLAMA_HOST);
  if (!disponible) {
    throw new Error(`Ollama no está disponible en ${OLLAMA_HOST}`);
  }

  // 2️⃣ Obtener respuesta cruda del modelo
  const respuesta = await llamarAOllama(prompt);
  console.log('Respuesta cruda del modelo:', respuesta);

  // 3️⃣ Extraer solo el primer objeto JSON que aparezca en la respuesta
  const match = respuesta.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`No se encontró JSON en la respuesta: ${respuesta}`);
  }

  // 4️⃣ Limpieza de caracteres de control
  const jsonLimpio = match[0].replace(/[\u0000-\u001F]+/g, '');

  // 5️⃣ Parseo seguro
  try {
    return JSON.parse(jsonLimpio);
  } catch (e) {
    throw new Error(`JSON inválido: ${e.message}\nContenido: ${jsonLimpio}`);
  }
}

