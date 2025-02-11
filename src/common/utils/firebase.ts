import admin from "firebase-admin"

import * as serviceAccount from "./sobee-firebase-sa.json"

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n")
  })
})

export const messaging = app.messaging()
