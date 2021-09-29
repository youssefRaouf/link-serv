import AutomatedShardController from "../controllers/AutomatedShardController";
import ManualShardController from "../controllers/ManualShardController";
import ShardController from "../controllers/ShardController";
import { isManual } from "../../index"
import DataController from "../controllers/DataController";

export default class MainRouter {

    constructor(app) {
        this.app = app;
        this.initializeRoutes();
    }

    initializeRoutes() {


        this.app.get('/', async (req, res) => {
            let result;
            if (!req.query.operation || !req.query.identifier) {
                res.status(400).json("bad format")
                return;
            }
            switch (req.query.operation) {
                case "getVersionCountsYearly":
                    result = await new AutomatedShardController().getVersionCountsYearly(req.query.identifier)
                    break;
                case "getVersionCountsMonthly":
                    if (!req.query.year) {
                        res.status(400).json("bad format");
                        return;
                    }
                    result = await new AutomatedShardController().getVersionCountsMonthly(req.query.identifier, req.query.year);
                    break;
                case "getVersionCountsDaily":
                    if (!req.query.year || !req.query.month || parseInt(req.query.month) > 12 || parseInt(req.query.month) < 1) {
                        res.status(400).json("bad format");
                        return;
                    }
                    result = await new AutomatedShardController().getVersionCountsDaily(req.query.identifier, req.query.year, req.query.month);
                    break;
                case "getVersions":
                    if (!req.query.datetime) {
                        res.status(400).json("bad format");
                        return;
                    }
                    result = await new AutomatedShardController().getVersions(req.query.identifier, req.query.datetime, res);
                    break;
                case "getGraph":
                    if (!req.query.timestamp || (req.query.depth && req.query.depth < 1) || new Date(parseInt(req.query.timestamp)) == "Invalid Date") {
                        res.status(400).json("bad format");
                    }
                    result = await new DataController.getGraph(req.query.identifier, req.query.timestamp, req.query.depth, req.query.timeElasticity);
                    res.send(result)
                    return;
                default:
                    break;
            }
            res.json(result)
        });

        this.app.post('/', async (req, res) => {
            let result;
            if (!req.query.operation) {
                res.status(400).json("bad format")
                return;
            }
            switch (req.query.operation) {
                case "updateGraph":
                    result = await DataController.updateGraph(req.body);
                    break;
                default:
                    break;
            }
            res.json(result)
        });

        this.app.get('/main', async (req, res) => {
            res.json({ "welcomeText": "welcome to BA" })
        });

        this.app.get('/flood', async (req, res) => {
            if (isManual) {
                const response = await new ManualShardController().floodDataBase();
                res.json(response)
            } else {
                const response = await new AutomatedShardController().floodDataBase();
                res.json(response)
            }
        });

        this.app.get('/flood/node', async (req, res) => {
            if (isManual) {
                const response = await new ManualShardController().floodDataBase();
                res.json(response)
            } else {
                const response = await new AutomatedShardController().floodDataBaseNode();
                res.json(response)
            }
        });

        this.app.post('/main', async (req, res) => {
            const response = await new ShardController().appendData(req.body.data);
            res.json("success");
        });

        this.app.post('/edge', async (req, res) => {
            const response = await new ShardController().insertEdge(req.body.from, req.body.to);
            res.json("success");
        });

        this.app.post('/short', async (req, res) => {
            if (isManual) {
                const response = await new ManualShardController().getShortedPath(req.body.from, req.body.to);
                res.json(response);
            } else {
                const response = await new AutomatedShardController().getShortedPath(req.body.from, req.body.to);
                res.json(response);
            }
        });
        this.app.get('/edge/year', async (req, res) => {
            const response = await new AutomatedShardController().getEdgesByYear(req.query.identifier, req.query.year);
            res.json(response);
        });

        this.app.get('/edge/month', async (req, res) => {
            const response = await new AutomatedShardController().getEdgesByMonth(req.query.identifier, req.query.year, req.query.month);
            res.json(response);
        });

        this.app.get('/edge/day', async (req, res) => {
            const response = await new AutomatedShardController().getEdgesByDay(req.query.identifier, req.query.year, req.query.month, req.query.day);
            res.json(response);
        });

        this.app.get('/graph', async (req, res) => {
            const response = await new AutomatedShardController().getGraph(req.query.identifier, req.query.timestamp, req.query.depth, req.query.timeElasticity);
            res.json(response);
        });
    }
}
