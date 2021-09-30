import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
const urlKey = process.env.URL
export const parseData = (data) => {
    const parsedData = data.split('\n');
    const nodes = [];
    const edges = []
    for (const element of parsedData) {
        if (element === '' || element === '\r') {
            continue;
        }
        const item = JSON.parse(element)
        if (item.an) {
            nodes.push({ key: Object.keys(item.an)[0], ...item.an[Object.keys(item.an)[0]] })
        } else {
            edges.push({ key: Object.keys(item.ae)[0], ...item.ae[Object.keys(item.ae)[0]] })
        }
    }
    return { nodes, edges };
}

export const parseGraphOutput = (nodes, edges) => {
    if (edges.length === 0) {
        return "";
    }
    dayjs.extend(utc);
    let result = "";
    nodes.forEach((node, i) => {
        result = result + `{"an": {${node._id}: {${process.env.IDENTIFIER}: ${node[urlKey]}, ${process.env.TYPE}: ${node.timestamp ? "VersionNode" : "Node"} ${node.timestamp ? `,${process.env.TIMESTAMP}:${dayjs.utc(node.timestamp).format("YYYYMMDDHHmmss")}` : ''}}}}\n`
    });
    edges.forEach(edge => {
        result = result + `{"ae": {${edge.edgeId}: {${process.env.TARGET}: ${edge.targetId}, ${process.env.DIRECTED}: "true", ${process.env.SOURCE}: ${edge.sourceId}}}}\n`
    });
    return result;
}
