// Run this in MongoDB Compass or mongosh to reset your bank connection
// Then you can reconnect properly

db.users.updateOne(
  { email: "AkDavid@gmail.com" },
  { 
    $set: { 
      bankConnected: false,
      monoAccountId: null
    } 
  }
)
