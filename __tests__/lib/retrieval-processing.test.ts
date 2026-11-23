/**
 * @jest-environment node
 *
 * Smoke tests for the file processors after the langchain 0.0.x -> 0.3.x
 * import migration. These exercise the real loaders and splitters.
 */
import {
  processCSV,
  processDocX,
  processJSON,
  processMarkdown,
  processPdf,
  processTxt
} from "@/lib/retrieval/processing"

const blob = (s: string, type = "text/plain") => new Blob([s], { type })

/** Builds a tiny single-page PDF containing `text`. */
function makePdf(text: string): Buffer {
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  ]
  const stream = `BT /F1 18 Tf 20 80 Td (${text}) Tj ET`
  objs[3] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  let out = "%PDF-1.4\n"
  const offsets: number[] = []
  objs.forEach((o, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  offsets.forEach(o => (out += `${String(o).padStart(10, "0")} 00000 n \n`))
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(out, "latin1")
}

const joined = (chunks: { content: string }[]) =>
  chunks.map(c => c.content).join(" ")

describe("retrieval processors (langchain 0.3 imports)", () => {
  it("txt", async () => {
    const chunks = await processTxt(blob("alpha beta gamma"))
    expect(chunks.length).toBeGreaterThan(0)
    expect(joined(chunks)).toContain("alpha beta gamma")
    expect(chunks[0].tokens).toBeGreaterThan(0)
  })

  it("markdown", async () => {
    const chunks = await processMarkdown(blob("# Title\n\nsome *markdown* body"))
    expect(joined(chunks)).toContain("Title")
  })

  it("csv", async () => {
    const chunks = await processCSV(blob("name,city\nAda,London\nGrace,NYC\n", "text/csv"))
    expect(joined(chunks)).toContain("Ada")
    expect(joined(chunks)).toContain("NYC")
  })

  it("json", async () => {
    const chunks = await processJSON(
      blob(JSON.stringify({ greeting: "hello json", n: 3 }), "application/json")
    )
    expect(joined(chunks)).toContain("hello json")
  })

  it("docx (text path)", async () => {
    const chunks = await processDocX("plain extracted docx text")
    expect(joined(chunks)).toContain("plain extracted docx text")
  })

  it("pdf", async () => {
    const chunks = await processPdf(
      new Blob([makePdf("Hello PDF smoke")], { type: "application/pdf" })
    )
    expect(joined(chunks)).toContain("Hello PDF smoke")
  })
})
