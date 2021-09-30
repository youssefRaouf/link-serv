import { edges } from "../models/Edges";
import { Node } from "../models/Node";
import ShardController from "./ShardController";
const nodeIds = [];
const urlKey = process.env.URL
const versionKey = process.env.VERSION
const fromKey = process.env.FROM
const toKey = process.env.TO
class AutomatedShardController extends ShardController {

    async getShortedPath(from, to) {
        const result = await this.shortestPathBfs(from, to, edges[0].edge)
        return result;
    }

    async floodDataBaseNode() {
        for (let i = 0; i < 10000; i++) {
            const n1 = Math.floor(Math.random() * 10000);
            try {
                const node = new Node({ [urlKey]: 'node' + n1 });
                const result = await node.save();
                nodeIds.push(result._id);
            } catch (e) {

            }
        }
    }

    async floodDataBase() {
        for (let i = 0; i < nodeIds.length; i++) {
            const id1 = nodeIds[Math.floor(Math.random() * nodeIds.length)];
            const id2 = nodeIds[Math.floor(Math.random() * nodeIds.length)];
            const edge = new edges[0].edge({ [fromKey]: id1, [toKey]: id2, [versionKey]: new Date().getTime() });
            await edge.save()
        }
    }

    async getVersionCountsYearly(identifier) {
        const node = await Node.findOne({ [urlKey]: identifier });
        if (node) {

            const result = await edges[0].edge.aggregate([
                {
                    $match: {
                        [fromKey]: node._id + ""
                    }
                },
                {
                    $group: {
                        _id: { $substr: [`$${versionKey}`, 0, 4] },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        counts: {
                            $push: {
                                k: "$_id",
                                v: "$count"
                            }
                        }
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: { $arrayToObject: "$counts" }
                    }
                }
            ]
            )
            return result.length > 0 ? result[0] : "";
        }
        return [];
    }

    async getVersionCountsMonthly(identifier, year) {
        const node = await Node.findOne({ [urlKey]: identifier });
        if (node) {
            const result = await edges[0].edge.aggregate([
                {
                    $match: {
                        [fromKey]: node._id + "",
                        [versionKey]: { $gte: `${year}0101000000`, $lte: `${year}1231000000` }
                    }
                },
                {
                    $group: {
                        _id: { $substr: [`$${versionKey}`, 4, 2] },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        counts: {
                            $push: {
                                k: "$_id",
                                v: "$count"
                            }
                        }
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: { $arrayToObject: "$counts" }
                    }
                }
            ]
            )
            return result.length > 0 ? result[0] : "";
        }
        return [];
    }

    async getVersionCountsDaily(identifier, year, month) {
        const node = await Node.findOne({ [urlKey]: identifier });
        if (node) {
            const result = await edges[0].edge.aggregate([
                {
                    $match: {
                        [fromKey]: node._id + "",
                        [versionKey]: { $gte: `${year}${month}01000000`, $lte: `${year}${month}31000000` }
                    }
                },
                {
                    $group: {
                        _id: { $substr: [`$${versionKey}`, 6, 2] },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        counts: {
                            $push: {
                                k: "$_id",
                                v: "$count"
                            }
                        }
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: { $arrayToObject: "$counts" }
                    }
                }
            ]
            )
            return result.length > 0 ? result[0] : "";
        }
        return ""
    }

    async getVersions(identifier, date, res) {
        const month = date.slice(4, 6);
        if (parseInt(month) > 12 || parseInt(month) < 1) {
            res.status(400).json("wrong format")
            return;
        }
        const node = await Node.findOne({ [urlKey]: identifier });
        if (node) {
            const result = await edges[0].edge.find({
                [fromKey]: node._id + "",
                [versionKey]: { $gte: `${date}000000`, $lte: `${date}235959` }
            })
            const results = result.map(edge => edge[versionKey])
            return results.join(',');
        }
        return "";
    }


    async getEdgesByYear(id, year) {
        const result = await edges[0].edge.find({ [fromKey]: id, [versionKey]: { $gte: `${year}-01-01`, $lte: `${year}-12-31` } })
        return result;
    }

    async getEdgesByMonth(id, year, month) {
        const result = await edges[0].edge.find({ [fromKey]: id, [versionKey]: { $gte: `${year}-${month}-01`, $lte: `${year}-${month}-31` } })
        return result;
    }

    async getEdgesByDay(id, year, month, day) {
        const result = await edges[0].edge.find({ [fromKey]: id, [versionKey]: { $gte: new Date(`${year}-${month}-${day}T00:00:00.000Z`).getTime(), $lte: new Date(`${year}-${month}-${day}T23:59:59.999Z`).getTime() } })
        return result;
    }
}

export default AutomatedShardController;