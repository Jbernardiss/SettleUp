import admin from "firebase-admin";
import serviceAccount from "./firebaseServiceAccount.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  // databaseURL: "https://<your-database-name>.firebaseio.com" // Uncomment if using Realtime Database
});

export default admin;