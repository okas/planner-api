export const unused = {}

/**
 * Output of IoTNode
 * @typedef {{ id: number; usage: string}} Output
 */

/**
 * IoTNode document
@typedef {
  {
    id: number;
    iottype: string;
    outputs: Output[];
  }
} IoTNodeDoc
 */

/** Lamp Model Document
 * @typedef {
  {
    id:number;
    name: string;
    room: string;
    valuestep:number;
  }
} LampDoc
 */

/** Blind Model Document
 * @typedef {
  {
    id:number;
    name: string;
    room: string;
    valuestep:number;
  }
} BlindDoc
 */

/**
  * @typedef {
  {
    id:number;
    name: string;
    schedule: string;
    active:boolean;
    devices:{id:number,type: string; value: number}[];
  }
} PersetDoc
  */
