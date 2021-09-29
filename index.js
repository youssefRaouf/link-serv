import 'dotenv/config';
import "regenerator-runtime/runtime";
import express from 'express';
import http from 'http';
import MainRouter from './src/routes/mainRoute';
import mongoose from "mongoose";
import { initializeModel } from "./src/models/Edges"
import { initializeModelNode } from './src/models/Node';
const app = express();
const server = http.createServer(app);
const connections = [];
const isManual = process.env.IS_MANUAL === 'false' ? false : true;

async function createConnections(urls = []) {
  urls.forEach(url => {
    mongoose.createConnection(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 1000,
    }).then((connection) => {
      connections.push(connection)
      initializeModel(connection);
      initializeModelNode(connection)
    }).catch(e => {
      console.log(e);
    })
  })
}

createConnections(process.env.MONGODB_HOSTS.split(", "));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text());
const port = 3000
new MainRouter(app);
server.listen(port, null, () => console.log(`dummy app listening on port ${port}!`))

export { connections, isManual };
