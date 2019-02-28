/**
 * Schema type definition
 * 
 * @typedef {Object} ServerSchema
 * @property {string} id Server designated id
 * @property {string} name Server name
 * @property {string} gameType Server type of gamemode/minigame
 * @property {string} ip Server exposed ip
 * @property {string} port Server port
 * @property {string} playersOnline Online players
 */
module.exports = class ServerSchema {
    constructor(name, gameType, ip, port, playersOnline = 0){
        this.id = ServerSchema.incrementId();
        this.name = name;
        this.gameType = gameType;
        this.ip = ip;
        this.port = port;
        this.playersOnline = playersOnline;
    }

    static incrementId() {
        if (!this.latestId){
            this.latestId = 1
        }else {
            this.latestId++;
        }

        return this.latestId;
      }
}