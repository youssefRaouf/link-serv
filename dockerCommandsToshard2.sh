
// from mongodb website

// config server
mongod --fork --configsvr --replSet configReplSet --dbpath ./data/config --logpath .configlog --bind_ip_all

mongosh --host <hostname> --port <port>

rs.initiate({_id: "configReplSet",configsvr: true,members: [{ _id : 0, host : "196.204.183.204:27019" }]})


// shards

mongod --fork --port 27018 --shardsvr --replSet shard1ReplSet --dbpath ./data/db --logpath .shard1log --bind_ip_all

mongod --fork --port 27018 --shardsvr --replSet shard2ReplSet --dbpath ./data/db --logpath .shard2log --bind_ip_all

mongosh --host <hostname> --port <port>

rs.initiate({_id : "shard2ReplSet",members: [{ _id : 0, host : "196.204.183.204:27018" }]})


// router
mongos --fork --port 27020 --configdb configReplSet/196.204.183.204:27019 --logpath .routerlog --bind_ip_all
mongosh --host <hostname> --port <port>
sh.addShard( "shard1ReplSet/196.204.183.203:27018")
sh.addShard( "shard2ReplSet/196.204.183.204:27018")
sh.enableSharding("link-serv")
db.adminCommand( { shardCollection: "link-serv.edges", key: { from: "hashed" } } )
db.adminCommand( { shardCollection: "link-serv.nodes", key: { url: "hashed" } } )



mongod --fork --port 27018 --shardsvr --replSet shard1ReplSet --dbpath ./data/db --logpath .shard1log --bind_ip_all
db.createUser({ user: "BA",pwd: "BA_LINK_SERV",roles: [ { role: "readWriteAnyDatabase", db: "admin" } ],authenticationRestrictions: [ { clientSource: ["196.204.183.204"] } ]});