/**
 * Shared helpers for API route security tests.
 * Builds a chainable fake of the supabase-js query builder.
 */

type Row = Record<string, any>

export function makeSupabaseMock(tables: Record<string, Row[]>) {
  const calls: { table: string; op: string; args: any[] }[] = []

  const from = (table: string) => {
    let rows = [...(tables[table] || [])]
    const builder: any = {
      select: (...args: any[]) => {
        calls.push({ table, op: "select", args })
        return builder
      },
      eq: (col: string, val: any) => {
        calls.push({ table, op: "eq", args: [col, val] })
        rows = rows.filter(r => r[col] === val)
        return builder
      },
      in: (col: string, vals: any[]) => {
        calls.push({ table, op: "in", args: [col, vals] })
        rows = rows.filter(r => vals.includes(r[col]))
        return Promise.resolve({ data: rows, error: null })
      },
      single: () =>
        Promise.resolve(
          rows.length === 1
            ? { data: rows[0], error: null }
            : { data: null, error: { message: "not found" } }
        ),
      upsert: (...args: any[]) => {
        calls.push({ table, op: "upsert", args })
        return Promise.resolve({ data: null, error: null })
      },
      update: (...args: any[]) => {
        calls.push({ table, op: "update", args })
        return builder
      },
      then: (resolve: any) => resolve({ data: rows, error: null })
    }
    return builder
  }

  const rpc = jest.fn(async () => ({
    data: [{ id: "item-1", content: "hello", similarity: 0.9 }],
    error: null
  }))

  return { client: { from, rpc }, calls, rpc }
}
