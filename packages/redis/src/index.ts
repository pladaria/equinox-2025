import {createClient} from 'redis';

const client = createClient({
    username: 'default',
    password: 'redispassword',
    database: 0,
});

export const redisInit = async () => {
    client.on('error', (err) => console.log('[redis] error', err));
    client.on('connect', () => console.log('[redis] connected'));
    await client.connect();
};

export const redisWrite = async (key: string, value: string) => {
    console.log('[redis] write:', {key, value});
    return client.set(key, value);
};

export const redisRead = async (key: string): Promise<string | null> => {
    console.log('[redis] read:', {key});
    return await client.get(key);
};

export const redisFlush = async () => {
    console.log('[redis] flush all');
    return await client.flushAll();
};

export const redisAddMember = async (key: string, values: Array<string> | string) => {
    console.log('[redis] set add', {key, values});
    return await client.sAdd(key, values);
};

export const redisGetMembers = async (key: string): Promise<Array<string>> => {
    console.log('[redis] set get', {key});
    return await client.sMembers(key);
};

export const redisRemoveMember = async (key: string, value: string) => {
    console.log('[redis] set remove', {key, value});
    return await client.sRem(key, value);
};
