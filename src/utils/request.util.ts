export const reduceHeaders = (headers: Record<string, string | undefined>) =>
  Object.entries(headers).reduce(
    (out, [key, val]) => {
      if (['cookie'].includes(key)) return out
      out[key] = val
      return out
    },
    {} as typeof headers,
  )
