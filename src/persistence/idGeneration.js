import FlakeId from 'flake-idgen'

const flakeIdGen = new FlakeId()

export default function generateDocId(doc) {
  /**
   * @type {Buffer}
   */
  // @ts-ignore
  const idBuf = flakeIdGen.next()
  const idInt = Number.parseInt(idBuf.toString('hex'), 16)
  doc.id = idInt
}
