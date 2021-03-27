interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryBackoff: number;
  retryOn: number[]
}

export const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryBackoff: 2,
  retryOn: [429, 503]
}

export type RetryInit = RequestInit & Partial<RetryConfig>

export const fetchRetry = (input: RequestInfo, init?: RetryInit): Promise<Response> => {
  const config: RequestInit & RetryConfig = {
    ...defaultRetryConfig,
    ...init
  }

  return new Promise((resolve, reject) => {
    const wrappedFetch = async (attempt: number) => {
      try {
        const response = await fetch(input, config)
        if (config.retryOn.includes(response.status)) {
          throw new Error(`response status: ${response.status}`)
        }
        resolve(response)
      } catch (error) {
        if (attempt < config.retries) {
          const delay = attempt === 0
            ? config.retryDelay
            : config.retryDelay * (config.retryBackoff * attempt)
          console.log(`fetch error, retrying in ${delay} ms`, error)
          setTimeout(() => wrappedFetch(++attempt), delay)
        } else {
          reject(error)
        }
      }
    }
    wrappedFetch(0)
  })
}