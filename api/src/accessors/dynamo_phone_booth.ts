import AWS from "aws-sdk";
import { ServiceConfigurationOptions } from "aws-sdk/lib/service";
import type { PhoneBoothItemType } from "shared-types/@types/database";

if ("development" === process.env.ENVIRONMENT) {
    const serviceConfigOptions: ServiceConfigurationOptions = {
        region: process.env.REGION,
        endpoint: process.env.ENDPOINT
    };
    AWS.config.update(serviceConfigOptions);
}
const docClient = new AWS.DynamoDB.DocumentClient();

export const Post = (phone_booth_data: PhoneBoothItemType): Promise<any> => {
    console.log("Post phone_booth_data:", phone_booth_data);
	return new Promise((resolve, reject) => {        
		const params = {
			TableName: process.env.PHONE_BOOTH_TABLE_NAME || "",
			Item: {
                ...phone_booth_data,
                update_timestamp: Date.now()
            }
		};
		
		docClient.put(params, (err, data) => {
			if (err) {
                console.error(err);
				reject(err);
			} else {
				console.log("Added item:", JSON.stringify(data, null, 2));
				resolve({
                    result_data: data
                });
			}
		});
	})
};

export const Get = (phone_booth_id: string): Promise<any> => {
    console.log("Get phone_booth_id:", phone_booth_id);
	const params = {
		TableName: process.env.PHONE_BOOTH_TABLE_NAME || "",
        KeyConditionExpression: "phone_booth_id = :phone_booth_id",
        ExpressionAttributeValues: {
            ":phone_booth_id": phone_booth_id
        },
	};
	
    return new Promise((resolve, reject) => {
        docClient.query(params, (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log("Query succeeded.");
                resolve({
                    result_data: data
                });
            }
        });
    });
};

export const Scan = (): Promise<any> => {
    console.log("Scan");
    const params = {
        TableName: process.env.PHONE_BOOTH_TABLE_NAME || "",
    };
    
    return new Promise((resolve, reject) => {
        docClient.scan(params, (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log("Scan succeeded.");
                resolve({
                    result_data: data
                });
            }
        });
    });
}

export const Update = async (phone_booth_id: string, door_status: "open" | "close"): Promise<any> => {
    console.log("Update phone_booth_id:", phone_booth_id);
    const params = {
        TableName: process.env.PHONE_BOOTH_TABLE_NAME || "",
        Key: {
            phone_booth_id: phone_booth_id
        },
        UpdateExpression: "set door_status = :door_status, update_timestamp = :update_timestamp",
        ExpressionAttributeValues: {
            ":door_status": door_status,
            ":update_timestamp": Date.now()
        },
        ReturnValues: "UPDATED_NEW"
    };

    return new Promise((resolve, reject) => {
        docClient.update(params, (err, data) => {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("UpdateBalance succeeded:", JSON.stringify(data, null, 2));
                resolve({
                    result_data: data
                });
            }
        });
    });
}

export const Delete = (phone_booth_id: string): Promise<any> => {
    console.log("Delete phone_booth_id:", phone_booth_id);
    const params = {
        TableName: process.env.PHONE_BOOTH_TABLE_NAME || "",
        Key: {
            phone_booth_id: phone_booth_id
        }
    };
    
    return new Promise((resolve, reject) => {
		docClient.delete(params, (err, data) => {
			if (err) {
				console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
			} else {
				console.log("DeleteItem  succeeded:", JSON.stringify(data, null, 2));
                resolve({
                    result_data: data
                });
			}
		});
	})
};
