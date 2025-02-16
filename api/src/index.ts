import * as dynamo_phone_booth from "./accessors/dynamo_phone_booth";
import type { LambdaEvent } from 'shared-types/@types/lambda';

/**
 * Lambda関数のエントリーポイント
 * @param event 
 * @returns 
 */
export const handler = async (event: LambdaEvent) => {
    console.log("event:", event);

    //Path Parameters
	let params: any = {};
	const method = event.requestContext.http.method; // メソッド（これを使う）
	let functionId: string = ""; // パスパラメタ１（これを使う）
	let mode: string = ""; // パスパラメタ２（これを使う）
	const query_params: Record<string, string> = event.queryStringParameters; // クエリパラメータ（これを使う）
	
	try {
		const [ _filler, tmp_functionId, tmp_mode_1 ] = event.requestContext.http.path.split("/");
		functionId = tmp_functionId;

		if ("undefined" !== typeof tmp_mode_1) {
			const queryStringIndex = tmp_mode_1.indexOf("?");
		
			//query parameterがある場合、それをはずしてPath Parameterの最後部を取得する
			if (queryStringIndex !== -1) {
				mode = tmp_mode_1.substring(0, queryStringIndex);
			} else {
				mode = tmp_mode_1;
			}
		}

		if ("undefined" !== typeof event.body)
		params = JSON.parse(event.body);

		if ("undefined" !== typeof query_params)
		console.log("query_params:", query_params);
		console.log("params:", params);

	} catch (error) {
		console.error("### Bad Request 1 ###", error);		
		return {
			statusCode: 400,
			body: `Bad Request`,
		};
	}

	console.log("functionId/mode:", `${functionId}/${mode}`);
	console.log("method:", method);
	
    try {
		let result: any = null;
		switch (`${functionId}/${mode}`) {
		case "door/sensor": // event
			switch (method) {
			case "GET":
				result = await dynamo_phone_booth.Get(query_params.boothId);
				break;
			case "POST":
				result = await dynamo_phone_booth.Post(params);
				break;
			case "PUT":
				result = await dynamo_phone_booth.Update(params.boothId, params.status);
				break;				
			case "DELETE":
				result = await dynamo_phone_booth.Delete(params.boothId);
				break;
			}
			break;

		case "door/sensor_list": // event
			switch (method) {
			case "GET":
				result = await dynamo_phone_booth.Scan();
				break;
			}
			break;

		default:
			console.log("server.ts 未設定 functionId/ID:", functionId, mode);
			return {
				statusCode: 404,
				body: {
					statusCode: 404,
					body: `Not Found`,
				},
			};
		}

		return {
			statusCode: 200,
			body: JSON.stringify(result),
			headers: {
				"Content-Type": "application/json"
			}
		};

	} catch (error: any) {
		/**
		 * エラーの型は次の通り
		 * statusCode: number
		 * body: {
		 *     message: string
		 * } 
		 */
		console.error("### Bad Request 2 ###", error);
		return {
			statusCode: 500,
			body: {
				statusCode: 500,
				body: JSON.parse(error.message)
			}
		}
	}
}