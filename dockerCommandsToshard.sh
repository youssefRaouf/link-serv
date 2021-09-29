
docker run --log-opt mode=non-blocking --network mynet --log-driver json-file --log-opt max-size=10m --log-opt max-file=10 -v /mongodb/data/db11:/data/db -p 27011:27017 --expose=27017 -d --name=mongodb11 mongo --shardsvr --replSet shard01 --dbpath /data/db --port 27017

docker run --log-opt mode=non-blocking --network mynet --log-driver json-file --log-opt max-size=10m --log-opt max-file=10 -v /mongodb/data/db21:/data/db -p 27021:27017 --expose=27017 -d --name=mongodb21 mongo --shardsvr --replSet shard02 --dbpath /data/db --port 27017

docker run --log-opt mode=non-blocking --network mynet --log-driver json-file --log-opt max-size=10m --log-opt max-file=10 -v /mongodb/configserver/data/db41:/data/db -d --expose=27017 --name=configserver41 mongo --configsvr --replSet configserver --dbpath /data/db --port 27017

docker run --log-opt mode=non-blocking --network mynet --log-driver json-file --log-opt max-size=10m --log-opt max-file=10 -p 27051:27017 --expose=27017 -d --name=mongos51 mongo mongos --port 27017 --configdb configserver/configserver41:27017 --bind_ip_all

docker exec -it configserver41 bash -c "echo 'rs.initiate({_id: \"configserver\",configsvr: true, members: [{ _id : 0, host : \"configserver41:27017\" }]})' | mongo"

docker exec -it mongodb11 bash -c "echo 'rs.initiate({_id : \"shard01\", members: [{ _id : 0, host : \"mongodb11:27017\" }]})' | mongo"

docker exec -it mongodb21 bash -c "echo 'rs.initiate({_id : \"shard02\", members: [{ _id : 0, host : \"mongodb21:27017\" }]})' | mongo"

docker exec -it mongos51 bash -c "echo 'sh.addShard(\"shard01/mongodb11\")' | mongo "

docker exec -it mongos51 bash -c "echo 'sh.addShard(\"shard02/mongodb21\")' | mongo "

docker exec -it mongodb11 bash -c "echo 'use testDb' | mongo"

docker exec -it mongos51 bash -c "echo 'sh.enableSharding(\"testDb\")' | mongo "

docker exec -it mongos51 bash -c "echo 'db.adminCommand( { "shardCollection": "\"testDb.edges"\", key: { from: "\"hashed"\" } } )' | mongo "

docker exec -it mongos51 bash -c "echo 'db.adminCommand( { "shardCollection": "\"testDb.nodes"\", key: { url: "\"hashed"\" } } )' | mongo "
