
/**
 * Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This file is licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 * http://aws.amazon.com/apache2.0/
 *
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
*/
import AWS from "aws-sdk";
import config from "config";
AWS.config.update({
    region: config.db_region,
	endpoint: config.db_endpoint
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "kvs",
    KeySchema: [       
        { AttributeName: "page", KeyType: "HASH"},  //Partition key
        { AttributeName: "key_id", KeyType: "RANGE" },  //Sort key
    ],
    AttributeDefinitions: [
        { AttributeName: "page", AttributeType: "S" },
        { AttributeName: "key_id", AttributeType: "S" },        
        { AttributeName: "update_timestamp", AttributeType: "N" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10,
    },
    LocalSecondaryIndexes: [
        {
            IndexName: "LSI-timestamp",
            KeySchema: [                
                {AttributeName: "page", KeyType: "HASH"},
                {AttributeName: "update_timestamp", KeyType: "RANGE"}
            ],
            Projection: {
                ProjectionType:"ALL"
            }
        }
    ],
    // GlobalSecondaryIndexes: [
    //     {
    //         IndexName: "GSI-expireDate",
    //         KeySchema: [
    //             {AttributeName: "roomId", KeyType: "HASH"},
    //             {AttributeName: "expireDate", KeyType: "RANGE"}
    //         ],
    //         Projection: {
    //             ProjectionType:"ALL"
    //         },
    //         ProvisionedThroughput: {
    //             ReadCapacityUnits: 5,
    //             WriteCapacityUnits: 5
    //         }
    //     }
    // ]
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
