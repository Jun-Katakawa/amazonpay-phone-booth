import machine
import network
import time
import urequests  # MicroPython用のHTTPリクエストライブラリ
import json  # MicroPython の json モジュールをインポート

# Wi-Fi設定
SSID = "Buffalo-2G-B4E0"  # ここにWi-FiのSSIDを入力
PASSWORD = "RNXwux3xEfcjSOg4"  # ここにWi-Fiのパスワードを入力

# HTTP設定
# URL = "https://pto3brxqi0.execute-api.ca-central-1.amazonaws.com/amazonpay-phone-booth/door/sensor"
URL = "https://u3chat.loclx.io/door/sensor"

# Room IDの設定
BOOTH_ID = "13F-003"

# ピン設定
reed_switch = machine.Pin(15, machine.Pin.IN, machine.Pin.PULL_UP)
led = machine.Pin("LED", machine.Pin.OUT)

# Wi-Fi接続関数
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)  # ステーションモードに設定
    wlan.active(True)  # Wi-Fiを有効化

    if not wlan.isconnected():  # すでに接続されていなければ接続
        print("Wi-Fi接続中...")
        wlan.connect(SSID, PASSWORD)

        for _ in range(10):  # 10秒以内に接続を試みる
            if wlan.isconnected():
                print(f"Wi-Fi接続成功: {wlan.ifconfig()}")
                return True
            time.sleep(1)

        print("Wi-Fi接続失敗")
        return False  # 接続失敗時の処理

    return True  # すでに接続済みならOK

# HTTP POST送信関数
def send_status(status):
    """HTTP POSTリクエストを送信"""
    if not connect_wifi():  # Wi-Fiが切れていたら再接続
        print("Wi-Fi未接続。再試行中...")
        return

    try:
        payload = '{"status":"' + status + '","boothId":"' + BOOTH_ID + '"}'  # 手動で JSON 文字列を作成
        headers = {
            "Authorization": "fWVlNOGhuBChiAXSACXwdVqeGaNlarKD",
            "Content-Type": "application/json",
            "Content-Length": str(len(payload))  # JSONデータのバイト数を指定
        }
        response = urequests.put(URL, data=payload.encode('utf-8'), headers=headers)
        print(f"Sent: {payload}, Response: {response.status_code}")
        response.close()
    except Exception as e:
        print(f"HTTP Error: {e}")

# Wi-Fi初期接続
connect_wifi()

# 初期状態
last_state = reed_switch.value()  # 初回の状態を取得

# メインループ（継続的に処理）
while True:
    current_state = reed_switch.value()

    if current_state != last_state:  # 状態が変化したらHTTP送信
        if current_state == 0:
            led.on()
            send_status("close")  # ドアが閉じた
        else:
            led.off()
            send_status("open")  # ドアが開いた

        last_state = current_state  # 状態を更新

    time.sleep(0.1)  # 負荷軽減のための短い待機

