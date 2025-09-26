import ollama from 'ollama';
import {redisWrite, redisRead, redisAddMember, redisGetMembers} from '@repo/redis';
import {traverseAndSet} from './utils';

const ACCEPTED_LOCALES = ['ca-ES', 'en-UK', 'eu-ES'];

const SYSTEM = [
    'Eres un traductor experto que traduce textos comerciales de una compañía telefónica.',
    'No traduzcas las monedas, si algo está en euros (€) déjalo igual.',
    'No traduzcas los nombres de productos, marcas o acrónimos.',
    'Ejemplos que no debes traducir: "Fibra 300 Mb", "Fibra 1 Gb", "M+", "Movistar", "Disney", "La Liga", "TV"',
    'Pero si "Fibra" se usa en un contexto de descripción, por ejemplo "Fibra simétrica", tradúcelo',
].join('\n');

const translate = async (namespace: string, text: string, locale: string): Promise<string> => {
    const key = `translation:${locale}:${text}`;
    const value = await redisRead(key);
    if (value) {
        console.log('[translate] cache hit', {key, value});
        return value;
    }

    console.log('[translate] cache miss', {key});
    const result = await ollama.generate({
        model: 'gpt-oss',
        system: SYSTEM,
        prompt: `Traduce el siguiente texto al locale ${locale}:\n${text}`,
        keep_alive: '1h',
        stream: false,
        options: {temperature: 0},
    });

    await redisWrite(key, result.response);

    return result.response;
};

export const translateJson = async (namespace: string, inputJson: any, locale: string): Promise<any> => {
    if (!ACCEPTED_LOCALES.includes(locale)) {
        return inputJson;
    }

    // clone because we will mutate the copy
    const json = structuredClone(inputJson);

    const paths = new Set<string>();

    const pathsEnabled = new Set(await redisGetMembers(`translation:paths:${namespace}:enabled`));
    console.log({pathsEnabled});

    await traverseAndSet(json, async (path, value) => {
        paths.add(path);
        if (pathsEnabled.has(path)) {
            return await translate(namespace, value, locale);
        }
        return value;
    });

    redisAddMember(`translation:namespaces`, namespace);
    redisAddMember(`translation:namespaces`, '/tos');
    redisAddMember(`translation:namespaces`, '/devices');

    redisAddMember(`translation:paths:${namespace}`, Array.from(paths));

    return json;
};
