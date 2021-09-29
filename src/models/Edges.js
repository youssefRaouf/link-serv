import mongoose from 'mongoose';
const versionKey = process.env.VERSION
const fromKey = process.env.FROM
const toKey = process.env.TO
let edges = [];
const initializeModel = (connection) => {
    const edgeSchema = new mongoose.Schema({
        [fromKey]: "String",
        [toKey]: "String",
        [versionKey]: "String"
    })
    edgeSchema.index({ [fromKey]: 1, [versionKey]: 1 });
    edgeSchema.index({ [toKey]: 1, [versionKey]: 1 });
    edgeSchema.index({ [fromKey]: 1, [toKey]: 1, [versionKey]: 1 }, { unique: true });
    const edge = connection.model('Edge', edgeSchema)
    edges.push({ edge, condition: 1 });
}

const setCondition = (i, condition) => {
    edges[i].condition = condition;
}

export { initializeModel, edges, setCondition };