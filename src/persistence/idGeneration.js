import FlakeId from 'flake-idgen'

/**
 * @param {Collection<any>[]} collections
 */
export default function attachIdGeneration(collections) {
  collections.forEach(c => {
    c.on('pre-insert', generateDocId)
  })
}

const flakeIdGen = new FlakeId()

function generateDocId(doc) {
  /**
   * @type {Buffer}
   */
  // @ts-ignore
  const idBuf = flakeIdGen.next()
  const idInt = Number.parseInt(idBuf.toString('hex'), 16)
  doc.id = idInt
}
