type CacheEntry<T> = {
    expiresAt: number;
    value: T;
};

const cache = new Map<string, CacheEntry<unknown>>();
const pending = new Map<string, Promise<unknown>>();

/**
 * Prevents duplicate upstream requests by sharing fresh and in-flight values between callers.
 */
export async function withCache<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }

    const existing = pending.get(key) as Promise<T> | undefined;
    if (existing) {
        return existing;
    }

    const operation = load()
        .then((value) => {
            cache.set(key, { expiresAt: Date.now() + ttlMs, value });
            return value;
        })
        .finally(() => pending.delete(key));

    pending.set(key, operation);
    return operation;
}
