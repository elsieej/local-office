import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { Document } from '#/lib/documents/types'

type LocalOfficeDb = DBSchema & {
  documents: {
    key: string
    value: Document
    indexes: { 'by-openedAt': number }
  }
}

const DB_NAME = 'local-office'
const DB_VERSION = 1
const STORE_NAME = 'documents'

let dbPromise: Promise<IDBPDatabase<LocalOfficeDb>> | undefined

function getDb() {
  dbPromise ??= openDB<LocalOfficeDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      store.createIndex('by-openedAt', 'openedAt')
    },
  })
  return dbPromise
}

export async function putDocumentMeta(document: Document): Promise<void> {
  const db = await getDb()
  await db.put(STORE_NAME, document)
}

export async function getDocumentMeta(
  id: string,
): Promise<Document | undefined> {
  const db = await getDb()
  return db.get(STORE_NAME, id)
}

export async function listDocumentMeta(): Promise<Array<Document>> {
  const db = await getDb()
  const all = await db.getAllFromIndex(STORE_NAME, 'by-openedAt')
  return all.reverse()
}

export async function deleteDocumentMeta(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE_NAME, id)
}
