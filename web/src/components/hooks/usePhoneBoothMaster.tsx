import axios from "axios";
import * as config from '../../config/default';
import { PhoneBoothItemType } from 'shared-types/@types/database';

/**
 * PhoneBoothを管理する
 */
export const usePhoneBoothMaster = () => {
	const headers = {
		'Content-Type': 'application/json',
		"Authorization": config.AUTHORIZATION_TOKEN
	};

	const getPhoneBooth = async (phoneBooth_id: string, idToken?: string): Promise<PhoneBoothItemType | null> => {
		return new Promise((resolve, reject) => {
			axios.get(config.WEBAPI_Function01 + `/door/sensor?boothId=${encodeURIComponent(phoneBooth_id)}`, {headers})
			.then((response: any) => {
				const result: any = response.data;
				resolve(result.result_data.Items[0]);
			})
			.catch((error: any) => {
				console.error(error);
				reject(error);
			});
		});
	}

	const getAllPhoneBooths = async (): Promise<PhoneBoothItemType[]> => {
		return new Promise((resolve, reject) => {
			axios.get(config.WEBAPI_Function01 + `/door/sensor_list`, {headers})
			.then((response: any) => {
				const result: any = response.data;
				const PhoneBooths: PhoneBoothItemType[] = result.result_data.Items.map((item: any) => {
					return item;
				});
				resolve(PhoneBooths);
			})
			.catch((error: any) => {
				console.error(error);
				reject(error);
			});
		});
	}

	const postPhoneBooth = async (postData: PhoneBoothItemType): Promise<string> => {
		return new Promise((resolve, reject) => {
			axios.post(config.WEBAPI_Function01 + `/door/sensor`, postData, {headers})
			.then((response: any) => {
				const result: any = response.data;
				resolve(result.result_data);
			})
			.catch((error: any) => {
				console.error(error);
				reject(error);
			});
		});
	}
	
	const deletePhoneBooth = async (phoneBooth_id: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			axios.delete(config.WEBAPI_Function01 + `/door/sensor?boothId=${encodeURIComponent(phoneBooth_id)}`, {headers})
			.then((response: any) => {
				const result: any = response.data;
				resolve(result.result_data);
			})
			.catch((error: any) => {
				console.error(error);
				reject(error);
			});
		});
	}

	return { getPhoneBooth, getAllPhoneBooths, postPhoneBooth, deletePhoneBooth };
}
