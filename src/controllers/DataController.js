import mongoose from "mongoose";
import { parseData, parseGraphOutput } from "../utils/dataHandler";
import ShardController from "./ShardController";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat"
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(customParseFormat)
const toKey = process.env.TO

class DataController {

    async updateGraph(data) {
        const shard = new ShardController();
        const { nodes: nodesData, edges: edgesData } = parseData(data);
        let sources = {};
        const nodePromises = [];
        const edgePromises = [];
        nodesData.forEach((node) => {
            nodePromises.push(shard.findOneAndUpdateNode(node.identifier))
            sources[node.key] = { timestamp: node.timestamp };
        })
        const results = await Promise.allSettled(nodePromises);
        results.forEach(({ value }, i) => {
            sources[Object.keys(sources)[i]] = { ...sources[Object.keys(sources)[i]], id: value._id }
        })
        edgesData.forEach((edge) => {
            const source = sources[edge.source];
            const target = sources[edge.target];
            edgePromises.push(shard.insertEdge(source.id, target.id, source.timestamp));
        })
        const res = (await Promise.allSettled(edgePromises)).filter((e) => e.status !== "rejected" && e.reason.codeName === "DuplicateKey");
        return res
    }

    async getGraph(identifier, timestamp, depth = 1, timeElasticity) {
        const shard = new ShardController();
        let versionQuery = timestamp;
        if (timeElasticity) {
            const upperBound = dayjs(timestamp, 'YYYYMMDDHHmmss').add(timeElasticity, 'm').utc(true).format("YYYYMMDDHHmmss");
            const lowerBound = dayjs(timestamp, 'YYYYMMDDHHmmss').add(-timeElasticity, 'm').utc(true).format("YYYYMMDDHHmmss");
            versionQuery = { $gte: lowerBound, $lte: upperBound }
        }
        const node = await shard.findNode(identifier);
        if (!node) {
            return "";
        }
        const queue = [];
        const dist = [];
        let nodesData = [node._id];
        const edgesData = []
        queue.push(node._id);
        dist[node._id] = 0;
        while (queue.length !== 0) {
            const visiting = queue.shift();
            if (dist[visiting] > depth - 1) {
                nodesData = await shard.getNodes(nodesData, versionQuery);
                return parseGraphOutput(nodesData, edgesData)
            }
            const adjacenyList = await shard.findEdge(visiting, versionQuery)
            for (let neighbour of adjacenyList) {
                if (neighbour !== node._id + "") {
                    queue.push(neighbour[toKey]);
                    const distance = dist[visiting] + 1;
                    dist[neighbour[toKey]] = distance;
                    if (!nodesData.includes(neighbour[toKey])) {
                        nodesData.push(mongoose.Types.ObjectId(neighbour[toKey]));
                    }
                }
                edgesData.push({ edgeId: neighbour._id, sourceId: visiting, targetId: neighbour[toKey] })
            }
        }
        nodesData = await shard.getNodes(nodesData, versionQuery);
        return parseGraphOutput(nodesData, edgesData)
    };
}

export default new DataController();