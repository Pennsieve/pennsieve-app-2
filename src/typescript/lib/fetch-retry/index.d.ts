interface RetryConfig {
    retries: number;
    retryDelay: number;
    retryBackoff: number;
    retryOn: number[];
}
export declare const defaultRetryConfig: RetryConfig;
export declare type RetryInit = RequestInit & Partial<RetryConfig>;
export declare const fetchRetry: (input: RequestInfo, init?: RetryInit | undefined) => Promise<Response>;
export {};
//# sourceMappingURL=index.d.ts.map