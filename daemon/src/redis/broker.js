const redis = require('redis').createClient

/**
 * Broker service to expose server to a redis server
 * 
 * @typedef {import('redis').RedisClient} RedisClient
 * @class
 * 
 * @property {RedisClient} client - Redis client
 * @property {string} host - Redis hostname
 * @property {string} port - Redis port
 * @property {string} options - Additional redis connection options
 */
module.exports = class Broker {

    constructor(host = "", port = "", options = {}){
        this.client = redis.createClient(port, host, options);
    }

    /**
     * Expose server to redis
     * 
     * @param {import('../models/serverSchema').ServerSchema} server 
     */
    async expose(server = {}){
        if(server === undefined){
            throw new Error("Server cannot be undefined");
        }

        if(Object.keys(server).length === 0 && server.constructor === Object){
            throw new Error("Server cannot be empty");
        }

        if(!(server instanceof ServerSchema)){
            throw new Error("Server must be the type of ServerSchema");
        }

        await this.client.hmset(`sv-${server.id}`, server);
    }

}