import { edges } from "../models/Edges";
import fs from "fs"
import { isManual } from "../..";
import { Node } from "../models/Node";
const urlKey = process.env.URL
const versionKey = process.env.VERSION
const fromKey = process.env.FROM
const toKey = process.env.TO
class ShardController {

    async appendData(data) {
        const appender = fs.createWriteStream('data.txt', {
            flags: 'a'
        })
        appender.write(data + '\n');
    }

    async insertEdge(from, to, version) {
        if (isManual) {
            const edge = new edges[Math.floor(Math.random() * edges.length)].edge({ [fromKey]: from, [toKey]: to, [versionKey]: version })
            return edge.save();
        }
        const edge = new edges[0].edge({ [fromKey]: from, [toKey]: to, [versionKey]: version })
        return edge.save();
    }

    async shortestPathBfs(startNode, stopNode, edge) {
        const visited = [];
        const queue = [];
        const dist = [];
        queue.push(startNode);
        dist[startNode] = 0;
        while (queue.length !== 0) {
            let visiting = queue.shift();
            let adjacenyList;
            adjacenyList = await edge.find({ [fromKey]: visiting })
            for (let neighbour of adjacenyList) {
                neighbour = neighbour[toKey];
                if (visited.indexOf(neighbour) === -1) {
                    visited.push(neighbour);
                    dist[neighbour] = dist[visiting] + 1;
                    queue.push(neighbour);
                }
                if (neighbour === stopNode) {
                    return dist[neighbour];
                }
            }
        }
        return -1;
    };


    async getNodes(nodes, version) {
        const response = await Node.find({ _id: { $in: nodes } }).exec();
        const result = []
        for (const node of response) {
            const edge = await edges[0].edge.findOne({ [versionKey]: version, [fromKey]: node._id + "" }).exec();
            result.push({ ...node._doc, timestamp: edge && edge[versionKey] })
        }
        return result;
    }

    findOneAndUpdateNode(url) {
        return Node.findOneAndUpdate({ [urlKey]: url }, { [urlKey]: url }, { upsert: true, new: true })
    }

    findEdge(from, version) {
        return edges[0].edge.find({ [fromKey]: from, [versionKey]: version })
    }

    findNode(url) {
        return Node.findOne({ [urlKey]: url });
    }

}


export default ShardController;