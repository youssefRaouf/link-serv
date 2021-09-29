import { edges, setCondition } from "../models/Edges";
import ShardController from "./ShardController";
import { connections } from "../../index";

class ManualShardController extends ShardController {
    constructor() {
        super();
        this.setConditions();
    }
    async getShortedPath(from, to) {
        let shortestPaths = [];
        edges.forEach(async (edge) => {
            if (edge.condition === 1) {
                shortestPaths.push(this.shortestPathBfs(from, to, edge.edge));
            }
        })
        const results = await Promise.allSettled(shortestPaths)
        return results;
    }

    async floodDataBase() {
        for (let i = 0; i < 5000; i++) {
            edges.forEach(async (edge) => {
                if (edge.condition === 1) {
                    const n1 = Math.floor(Math.random() * 300);
                    const n2 = Math.floor(Math.random() * 300);
                    const edge = new edges[0].edge({ from: `node${n1}`, to: `node${n2}` });
                    await edge.save()
                }
            })
        }
    }

    setConditions() {
        setInterval(() => {
            connections.forEach((c, i) => {
                if (c.readyState !== edges[i].condition) {
                    setCondition(i, c.readyState)
                    console.log(edges);
                }
            });
        }, 1000)
    }
}

export default ManualShardController;