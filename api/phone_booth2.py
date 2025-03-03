import machine
import network
import time
import urequests
import json

# **エンドポイントのベースURL**
BASE_URL = "https://u3chat.loclx.io"
URL = f"{BASE_URL}/door/sensor"
LOG_URL = f"{BASE_URL}/door/sensor_log"

# **Booth ID**
BOOTH_ID = "13F-003"

# Wi-Fi設定
SSID = "Extender-2G-C200"
PASSWORD = "bmrfy53rk5dmk"

# 超音波センサー（HC-SR04）のピン設定
TRIG_PIN = 2
ECHO_PIN = 3
trig = machine.Pin(TRIG_PIN, machine.Pin.OUT)
echo = machine.Pin(ECHO_PIN, machine.Pin.IN)

# PIR センサー（人感センサー）
PIR_PIN = 4
pir = machine.Pin(PIR_PIN, machine.Pin.IN)

# LEDとエラー通知用GPIO
STATUS_LED = machine.Pin("LED", machine.Pin.OUT)  # メインLED
WIFI_ERROR_PIN = machine.Pin(4, machine.Pin.OUT)  # Wi-Fi接続失敗時
HTTP_ERROR_PIN = machine.Pin(5, machine.Pin.OUT)  # HTTPエラー時

# 状態管理変数
motion_history = []  # 10秒分のモーションデータ
no_motion_counter = 0  # 60秒のノーモーションカウント
distance_samples = []  # 超音波センサーの初期平均値保存用
initialized = False  # 初期化完了フラグ
average_distance = None  # 初期計測の中央値距離
last_status = "open"  # 初回は "open" に設定
counter = 0  # 60回ごとにログ送信用
distance = None  # **修正: `distance` を初期化**

# **Wi-Fi接続関数**
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    WIFI_ERROR_PIN.off()  # Wi-FiエラーOFF
    try:
        print("📡 Wi-Fi接続開始...")
        if not wlan.isconnected():
            wlan.connect(SSID, PASSWORD)
            for _ in range(10):
                if wlan.isconnected():
                    print(f"✅ Wi-Fi接続成功: {wlan.ifconfig()}")
                    return True
                time.sleep(1)
            print("❌ Wi-Fi接続失敗")
            WIFI_ERROR_PIN.on()  # Wi-FiエラーON
            return False
        return True
    except Exception as e:
        print(f"⚠ Wi-Fiエラー: {e}")
        WIFI_ERROR_PIN.on()
        return False

# **HTTP通信関数（PUT: ステータス送信）**
def send_status(status):
    if not connect_wifi():
        return
    try:
        payload = json.dumps({"status": status, "boothId": BOOTH_ID})
        headers = {"Authorization": "fWVlNOGhuBChiAXSACXwdVqeGaNlarKD", "Content-Type": "application/json"}
        response = urequests.put(URL, data=payload, headers=headers)
        print(f"📤 Sent: {payload}, Response: {response.status_code}")
        if not (200 <= response.status_code < 300):
            print(f"❌ HTTPエラー: {response.status_code}")
            HTTP_ERROR_PIN.on()
        else:
            HTTP_ERROR_PIN.off()
        response.close()
    except Exception as e:
        print(f"⚠ HTTP通信エラー: {e}")
        HTTP_ERROR_PIN.on()

# **HTTP通信関数（POST: ログ送信）**
def send_log(log_data):
    if not connect_wifi():
        return
    try:
        payload = json.dumps({"log": log_data})
        headers = {"Authorization": "fWVlNOGhuBChiAXSACXwdVqeGaNlarKD", "Content-Type": "application/json"}
        response = urequests.post(LOG_URL, data=payload, headers=headers)
        print(f"📤 Log Sent: {payload}, Response: {response.status_code}")
        if not (200 <= response.status_code < 300):
            print(f"❌ HTTPエラー: {response.status_code}")
            HTTP_ERROR_PIN.on()
        else:
            HTTP_ERROR_PIN.off()
        response.close()
    except Exception as e:
        print(f"⚠ HTTP通信エラー: {e}")
        HTTP_ERROR_PIN.on()

# **超音波センサーで距離測定**
def measure_distance():
    try:
        trig.low()
        time.sleep_us(2)
        trig.high()
        time.sleep_us(10)
        trig.low()
        pulse_start = time.ticks_us()
        timeout = time.ticks_us() + 30000
        while echo.value() == 0:
            if time.ticks_us() > timeout:
                return -1
            pulse_start = time.ticks_us()
        pulse_end = time.ticks_us()
        timeout = time.ticks_us() + 30000
        while echo.value() == 1:
            if time.ticks_us() > timeout:
                return -1
            pulse_end = time.ticks_us()
        distance = round((pulse_end - pulse_start) * 0.0343 / 2, 2)
        print(f"📏 超音波センサー距離測定: {distance} cm")
        return distance
    except Exception as e:
        print(f"⚠ 距離測定エラー: {e}")
        return -1

# **Wi-Fi初期接続**
connect_wifi()

# **メインループ**
while True:
    try:
        motion = pir.value()
        print(f"🟢 人感センサー: {motion}")  # PIRの状態を表示
        motion_history.append(motion)
        if len(motion_history) > 10:
            motion_history.pop(0)  # 10秒間の履歴を維持

        # **1: 人感センサーで在室判定**
        if motion_history.count(1) >= 5:
            status = "close"
            no_motion_counter = 0
        # **2: 60秒間モーションなしなら超音波で再チェック**
        elif no_motion_counter >= 60:
            distance = measure_distance()
            if distance != -1:
                status = "close" if distance < (average_distance - 15) else "open"
            else:
                status = last_status  # 測定失敗時は変更しない
            no_motion_counter = 0
        else:
            status = last_status
            no_motion_counter += 1

        # **状態変化時のみ送信**
        if status != last_status or counter % 60 == 0:
            print(f"🏠 状態: {status}")
            send_status(status)
            send_log({"booth_id": BOOTH_ID, "distance": distance if distance else "N/A"})
            last_status = status

        # **LED点滅**
        STATUS_LED.on()
        time.sleep(0.5)
        STATUS_LED.off()
        time.sleep(0.5)

        counter += 1

    except Exception as e:
        print(f"⚠ メインループエラー: {e}")
        for _ in range(3):
            STATUS_LED.on()
            time.sleep(0.2)
            STATUS_LED.off()
            time.sleep(0.2)
