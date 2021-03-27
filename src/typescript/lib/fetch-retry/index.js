export const defaultRetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryBackoff: 2,
    retryOn: [429, 503]
};
export const fetchRetry = (input, init) => {
    const config = {
        ...defaultRetryConfig,
        ...init
    };
    return new Promise((resolve, reject) => {
        const wrappedFetch = async (attempt) => {
            try {
                const response = await fetch(input, config);
                if (config.retryOn.includes(response.status)) {
                    throw new Error(`response status: ${response.status}`);
                }
                resolve(response);
            }
            catch (error) {
                if (attempt < config.retries) {
                    const delay = attempt === 0
                        ? config.retryDelay
                        : config.retryDelay * (config.retryBackoff * attempt);
                    console.log(`fetch error, retrying in ${delay} ms`, error);
                    setTimeout(() => wrappedFetch(++attempt), delay);
                }
                else {
                    reject(error);
                }
            }
        };
        wrappedFetch(0);
    });
};
//# sourceMappingURL=index.js.map