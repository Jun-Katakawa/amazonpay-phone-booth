/**
 * PhoneBooth
 */
export interface PhoneBoothItemType {
    phone_booth_id: string,
    floor: string,
    booth_type: string,
    door_status: "open" | "close",
    description: string,
    update_timestamp?: number,
}
