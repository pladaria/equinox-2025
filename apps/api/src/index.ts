import 'dotenv-flow/config';
import Fastify from 'fastify';
import products from './products.json';
import {redisInit, redisFlush, redisGetMembers, redisAddMember, redisRemoveMember} from '@repo/redis';
import {translateJson} from './translate';

const server = Fastify({});

server.addHook('onSend', async (_request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
});

server.get('/products/:locale', async (request, reply) => {
    const {locale = 'es-ES'} = request.params as {locale: string};
    try {
        // return products;
        return await translateJson('/products', products, locale);
    } catch (error) {
        return reply.status(500).send({error: 'Internal Server Error' + error});
    }
});

{
    server.get('/api/namespaces', async (request, reply) => {
        return await redisGetMembers('translation:namespaces');
    });

    server.get('/api/paths/:namespace', async (request, reply) => {
        const {namespace} = request.params as {namespace: string};
        return await redisGetMembers('translation:paths:' + namespace);
    });

    server.get('/api/paths/:namespace/add', async (request, reply) => {
        const {namespace} = request.params as {namespace: string};
        const {path} = request.query as {path?: string};
        if (path) {
            return await redisAddMember('translation:paths:' + namespace + ':enabled', path);
        }
    });

    server.get('/api/paths/:namespace/remove', async (request, reply) => {
        const {namespace} = request.params as {namespace: string};
        const {path} = request.query as {path?: string};
        if (path) {
            return await redisRemoveMember('translation:paths:' + namespace + ':enabled', path);
        }
    });

    server.get('/api/paths/:namespace/enabled', async (request, reply) => {
        const {namespace} = request.params as {namespace: string};
        return await redisGetMembers('translation:paths:' + namespace + ':enabled');
    });
}

const start = async () => {
    await redisInit();
    // await redisFlush();
    try {
        const port = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3001;
        const host = process.env.API_HOST || '0.0.0.0';
        await server.listen({port, host});
        console.log(`Server started at ${host}:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
