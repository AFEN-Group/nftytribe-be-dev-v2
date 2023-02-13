const { Model, Sequelize } = require("sequelize");
/**
 * @typedef {Object} CreatePhysicalItem object required to create physical items
 * @property {String} imageKey image key stored in redis, if available means the physical item would have an image
 */

/**
 * @typedef { Record<string, typeof Model> } DB sequelize db object
 *
 */
