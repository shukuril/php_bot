import sys
import json
import requests
from PyQt5.QtWidgets import QApplication
from PyQt5.QtWebEngineWidgets import QWebEngineView
from aiogram import Bot, Dispatcher, executor, types
from aiogram.types.web_app_info import WebAppInfo

API_TOKEN = '6709308319:AAGRwA-HBuEtO7wVXIkwrl-dhHJ7pToHjFg'
CHAT_ID = '-1002037056729'

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

class Api:
    def submit_order(self, order_details):
        print("Order details received:", order_details)
        return "Order processed successfully"

async def send_data_to_telegram(data):
    try:
        await bot.send_message(chat_id=CHAT_ID, text=data)
    except Exception as e:
        print("Error sending message to Telegram:", e)

def fetch_data_from_website():
    try:
        response = requests.get('')
        if response.status_code == 200:
            return response.json()
        else:
            print("Failed to fetch data from the website. Status code:", response.status_code)
            return None
    except Exception as e:
        print("Error fetching data from the website:", e)
        return None

@dp.message_handler(commands=['start'])
async def start(message: types.Message):
    inline_markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    inline_markup.add(types.KeyboardButton('Open Web Page', web_app=WebAppInfo(url='')))
    await message.answer('Hello', reply_markup=inline_markup)

@dp.message_handler(content_types=['web_app_data'])
async def web_app(message: types.Message):
    try:
        res = json.loads(message.web_app_data.data)
        await send_data_to_telegram(res)
    except Exception as e:
        print("Error processing web app data:", e)

@dp.message_handler(commands=['fetch_data'])
async def fetch_and_send_data(message: types.Message):
    website_data = fetch_data_from_website()
    if website_data:
        await send_data_to_telegram(json.dumps(website_data, indent=4))
        await message.answer("Data fetched from the website sent to Telegram.")
    else:
        await message.answer("Failed to fetch data from the website.")

def main():
    app = QApplication(sys.argv)
    web = QWebEngineView()
    web.load('')
    web.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    # Start the PyQt5 application
    main()
    
    # Start the Telegram bot polling
    executor.start_polling(dp, skip_updates=True)
