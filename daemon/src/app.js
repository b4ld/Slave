const logger = require('./config/logger')()
const { DockerController } = require('./docker/dockerController')

logger.info('Loading daemon...')

const dockerController = new DockerController()
