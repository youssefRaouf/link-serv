import mongoose from 'mongoose';
let Node;
const urlKey = process.env.URL
const initializeModelNode = (connection) => {
    const nodeSchema = new mongoose.Schema({
        [urlKey]: { type: String, index: true, unique: true },
    });
    Node = connection.model('Node', nodeSchema);
}
export { Node, initializeModelNode };