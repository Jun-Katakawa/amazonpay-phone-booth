## DB Start
cd "C:\home\dynamodb"
java -D"java.library.path=./DynamoDBLocal_lib" -jar DynamoDBLocal.jar -sharedDb -port 8008

## Table Create
aws dynamodb create-table --table-name Persons --attribute-definitions AttributeName=Id,AttributeType=N --key-schema AttributeName=Id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 --endpoint-url http://localhost:8008


https://zenn.dev/satokazur222/articles/1b355b5979566a#%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AE%E7%99%BB%E9%8C%B2

https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.01.html
