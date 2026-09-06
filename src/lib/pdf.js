import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const DATE_RE = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\b/;
const DATE_LABEL_RE =
  /(?:data(?: do exame| de coleta| de realiza[cç][aã]o| de emiss[aã]o)?|realizado em|coletado em)\s*[:-]?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{4})/i;
const NAME_LABEL_RE = /(?:exame|procedimento|tipo de exame)\s*[:-]\s*(.+)/i;
const LOCAL_LABEL_RE = /(?:local|unidade|laborat[oó]rio|cl[ií]nica|hospital)\s*[:-]\s*(.+)/i;

const STATUS_KEYWORDS = [
  { status: "Crítico", words: ["crítico", "critico", "urgente", "grave"] },
  { status: "Atenção", words: ["atenção", "atencao", "alterado", "anormal", "irregular"] },
];

export async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let line = "";
    for (const item of content.items) {
      line += item.str;
      if (item.hasEOL) {
        text += line.trimEnd() + "\n";
        line = "";
      } else if (item.str && !item.str.endsWith(" ")) {
        line += " ";
      }
    }
    if (line.trim()) text += line.trimEnd() + "\n";
  }
  return text.trim();
}

function cleanLine(line) {
  return line.split(/\s{2,}|\t/)[0].trim().slice(0, 120);
}

function guessDate(text) {
  const labeled = text.match(DATE_LABEL_RE);
  const raw = labeled ? labeled[1] : null;
  const match = raw ? raw.match(DATE_RE) : text.match(DATE_RE);
  if (!match) return null;
  const [, d, m, y] = match;
  const day = d.padStart(2, "0");
  const month = m.padStart(2, "0");
  if (Number(month) > 12 || Number(day) > 31) return null;
  return `${y}-${month}-${day}`;
}

function guessStatus(text) {
  const lower = text.toLowerCase();
  for (const { status, words } of STATUS_KEYWORDS) {
    if (words.some((w) => lower.includes(w))) return status;
  }
  return "Normal";
}

function guessNameFromFile(fileName) {
  return fileName
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

function guessName(text, fileName) {
  const labeled = text.match(NAME_LABEL_RE);
  if (labeled) return cleanLine(labeled[1]);

  const firstLine = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 2 && !DATE_RE.test(l));
  if (firstLine) return cleanLine(firstLine);

  return guessNameFromFile(fileName);
}

function guessLocal(text) {
  const labeled = text.match(LOCAL_LABEL_RE);
  return labeled ? cleanLine(labeled[1]) : "";
}

export function parseExamPdfText(text, fileName) {
  return {
    name: guessName(text, fileName),
    date: guessDate(text),
    status: guessStatus(text),
    local: guessLocal(text),
    result: text.slice(0, 4000),
  };
}
