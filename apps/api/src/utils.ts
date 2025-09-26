type Empty = null | undefined | void;

type TraverseCallback = (path: string, value: string) => string | Empty | Promise<string | Empty>;

const isObject = (v: any) => typeof v === 'object' && v !== null;

export const traverseAndSet = async (value: any, callback: TraverseCallback, path = ''): Promise<any> => {
    if (!isObject(value)) {
        if (!(typeof value === 'string')) {
            return value;
        }
        const newValue = await callback(path, value as string);
        return newValue !== undefined && newValue !== null ? newValue : value;
    }

    if (Array.isArray(value)) {
        const results = await Promise.all(
            value.map((item, i) => traverseAndSet(item, callback, path /* ? `${path}[${i}]` : `[${i}]` */))
        );
        for (let i = 0; i < results.length; i++) value[i] = results[i];
        return value;
    }

    for (const key of Object.keys(value)) {
        const currentPath = path ? `${path}.${key}` : key;
        const newVal = await traverseAndSet(value[key], callback, currentPath);
        value[key] = newVal;
    }

    return value;
};
