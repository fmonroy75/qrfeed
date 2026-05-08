// src/firebase/storage.js
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { app } from './index'

const storage = getStorage(app)

export const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return url
}

export const uploadLogo = async (file, tenantId) => {
  const path = `tenants/${tenantId}/logo/${file.name}`
  return uploadImage(file, path)
}
