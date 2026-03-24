// ─── PDF Lab Result Parser ───────────────────────────────────────────────────
// Uses pdfjs-dist to extract text from uploaded lab PDFs,
// then applies heuristics to identify marker names, values, units, and refs.

import * as pdfjsLib from 'pdfjs-dist'

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }
  return fullText
}

// ─── Heuristic parser ────────────────────────────────────────────────────────
// Tries to match lines like:
//   "Hemoglobina  14.5  g/dL  (13.0 - 17.0)"
//   "Glicemia: 95 mg/dL  VR: 70-100"
//   "Colesterol Total 185 mg/dL <200"

const NUMBER_RE = /[\d]+(?:[.,]\d+)?/g
const UNIT_RE = /\b(g\/dL|g\/L|mg\/dL|mmol\/L|U\/L|mU\/L|μU\/mL|ng\/mL|pg\/mL|μg\/dL|%|×10³\/μL|×10⁶\/μL|fL|pg|mEq\/L|IU\/L|IU\/mL|mmHg|nmol\/L|pmol\/L|μmol\/L|mcg\/dL|mcIU\/mL)\b/i

export function parseLabText(rawText) {
  const markers = []
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    // Must contain at least one number
    if (!NUMBER_RE.test(line)) continue
    NUMBER_RE.lastIndex = 0

    const unitMatch = line.match(UNIT_RE)
    if (!unitMatch) continue

    const unit = unitMatch[0]
    const unitIdx = line.indexOf(unit)

    // Text before unit = name + value candidate
    const before = line.slice(0, unitIdx).trim()
    const after = line.slice(unitIdx + unit.length).trim()

    // Extract all numbers from 'before'
    const nums = [...before.matchAll(/[\d]+(?:[.,]\d+)?/g)]
    if (nums.length === 0) continue

    // Last number before unit is the value; everything before it is the name
    const valMatch = nums[nums.length - 1]
    const value = parseFloat(valMatch[0].replace(',', '.'))
    const name = before.slice(0, valMatch.index).replace(/[:\-–]+$/, '').trim()

    if (!name || name.length < 2) continue

    // Parse reference range from 'after'
    const refNums = [...after.matchAll(/[\d]+(?:[.,]\d+)?/g)]
    let refMin = null, refMax = null
    if (refNums.length >= 2) {
      refMin = parseFloat(refNums[0][0].replace(',', '.'))
      refMax = parseFloat(refNums[1][0].replace(',', '.'))
    } else if (refNums.length === 1) {
      // Format like "<200" or ">50"
      const ltgt = after.match(/[<>]\s*[\d]+(?:[.,]\d+)?/)
      if (ltgt) {
        if (ltgt[0].startsWith('<')) refMax = parseFloat(ltgt[0].slice(1).replace(',', '.'))
        else refMin = parseFloat(ltgt[0].slice(1).replace(',', '.'))
      }
    }

    markers.push({ name, value, unit, refMin, refMax })
  }

  return markers
}

export function markerStatus(marker) {
  const { value, refMin, refMax } = marker
  if (refMin !== null && value < refMin) return 'low'
  if (refMax !== null && value > refMax) return 'high'
  if (refMin !== null || refMax !== null) return 'normal'
  return 'unknown'
}
