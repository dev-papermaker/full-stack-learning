> mongoimport

```
mongoimport --db yelpcamp --collection "campgrounds" --drop --type json --host cluster0-shard-00-02-fkxcp.mongodb.net:27017  --file "/Users/ql/Desktop/s5/7208-CLOUD COMPUTING/a2-due11:10/local_repo/docker_node_app/cloud-computing-repo/memos.json" --jsonArray --authenticationDatabase admin --ssl --username myusername --password 42

```

> mongodb connect to atlas

```
// mongodb
// mongo "mongodb+srv://cluster0-fkxcp.mongodb.net/yelpcamp"  --username myusername

```

> spark install mongodb connector

```
// sudo spark-shell --conf "spark.mongodb.input.uri=mongodb://127.0.0.1/test.myCollection?readPreference=primaryPreferred" \
//               --conf "spark.mongodb.output.uri=mongodb://127.0.0.1/test.myCollection" \
//               --packages org.mongodb.spark:mongo-spark-connector_2.11:2.3.2
```
