const jsonServer = require("json-server");
const cors = require("cors");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccount = require("./firebase-adminsdk.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db", "db.json"));
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);

// Middleware to protect routes
server.use((req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (token) {
    admin.auth().verifyIdToken(token)
      .then(decodedToken => {
        req.user = decodedToken;
        next();
      })
      .catch(error => {
        console.error('Error verifying token:', error);
        res.status(401).send('Unauthorized');
      });
  } else {
    res.status(401).send('Unauthorized');
  }
});

server.use(router);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
});