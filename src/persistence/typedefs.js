export const unused = {}

/**
 * Base document to store LokiJS collection. It is intentionaly defined instead on @see {@link LokiObj} to only have one property.
 * @interface
 * @typedef { {$loki: number;}} DBDoc
 */

/**
 * IoTNode database document
 * @implements {DBDoc}
 * @typedef {import('../model/typedefs').IoTNodeDoc & DBDoc } IoTNodeDBDoc
 */

/**
 * @implements {DBDoc}
 * @typedef {import('../model/typedefs').LampDoc & DBDoc} LampDBDoc
 */
/**
 * @implements {DBDoc}
 * @typedef {import('../model/typedefs').BlindDoc & DBDoc} BlindDBDoc
 */

/**
 * @implements {DBDoc}
 * @typedef { import('../model/typedefs').PersetDoc & DBDoc} PresetDBDoc
 */
