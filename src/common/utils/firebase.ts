import admin from "firebase-admin"

import * as serviceAccount from "./sobee-firebase-sa.json"

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
})

export const messaging = app.messaging()
