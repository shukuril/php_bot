import json
import aiohttp
import asyncio
from aiogram import Bot, Dispatcher, executor, types
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo, ReplyKeyboardRemove
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.dispatcher import FSMContext
from aiogram.dispatcher.filters.state import State, StatesGroup

# Initialize bot and dispatcher with memory storage
bot = Bot('6709308319:AAGRwA-HBuEtO7wVXIkwrl-dhHJ7pToHjFg')
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)

# Define states
class Form(StatesGroup):
    name = State()
    location = State()
    manual_location = State()
    phone_number = State()
    manual_phone_number = State()

# Temporary storage for user data
user_data = {}

# Function for sending data to Telegram
async def send_data_to_telegram(data):
    await bot.send_message(chat_id="-1002037056729", text=data)

# Function for fetching data from a website
async def fetch_data_from_website():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('https://shukuril.github.io/php_bot/') as response:
                data = await response.json()
                return data
    except Exception as e:
        print("Error fetching data from website:", e)
        return None

@dp.message_handler(commands=['start'])
async def start(message: types.Message):
    await Form.name.set()
    await message.answer('Привет! Как вас зовут?', reply_markup=ReplyKeyboardRemove())

@dp.message_handler(state=Form.name)
async def ask_name(message: types.Message, state: FSMContext):
    user_data['name'] = message.text
    location_markup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    location_markup.add(KeyboardButton('Отправить геолокацию', request_location=True))
    location_markup.add(KeyboardButton('Ввести вручную'))
    await Form.next()
    await message.answer('Пожалуйста, укажите место доставки:', reply_markup=location_markup)

@dp.message_handler(lambda message: message.text == 'Ввести вручную', state=Form.location)
async def manual_location(message: types.Message):
    await Form.manual_location.set()
    await message.answer('Пожалуйста, введите место доставки:')

@dp.message_handler(state=Form.manual_location)
async def receive_manual_location(message: types.Message, state: FSMContext):
    user_data['location'] = message.text
    await ask_phone_number(message)

@dp.message_handler(content_types=['location'], state=Form.location)
async def receive_location(message: types.Message, state: FSMContext):
    latitude = message.location.latitude
    longitude = message.location.longitude
    user_data['location'] = f"https://www.google.com/maps/search/?api=1&query={latitude},{longitude}"
    await ask_phone_number(message)

async def ask_phone_number(message: types.Message):
    phone_markup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    phone_markup.add(KeyboardButton('Отправить номер телефона', request_contact=True))
    phone_markup.add(KeyboardButton('Ввести вручную'))
    await Form.phone_number.set()
    await message.answer('Пожалуйста, отправьте ваш номер телефона:', reply_markup=phone_markup)

@dp.message_handler(lambda message: message.text == 'Ввести вручную', state=Form.phone_number)
async def manual_phone_number(message: types.Message):
    await Form.manual_phone_number.set()
    await message.answer('Пожалуйста, введите ваш номер телефона:')

@dp.message_handler(state=Form.manual_phone_number)
async def receive_manual_phone_number(message: types.Message, state: FSMContext):
    user_data['phone_number'] = message.text
    await send_summary(message, state)

@dp.message_handler(content_types=['contact'], state=Form.phone_number)
async def receive_phone_number(message: types.Message, state: FSMContext):
    user_data['phone_number'] = message.contact.phone_number
    await send_summary(message, state)

async def send_summary(message: types.Message, state: FSMContext):
    summary = f"Buyurtmachini ismi: {user_data['name']}\n\nYetkazib berish joyi: {user_data['location']}\n\nTelefon raqami: {user_data['phone_number']}"
    await send_data_to_telegram(summary)
    inline_markup = ReplyKeyboardMarkup(resize_keyboard=True)
    inline_markup.add(KeyboardButton('Открыть веб страницу', web_app=WebAppInfo(url='https://shukuril.github.io/php_bot/')))
    await message.answer('Спасибо! Вот информация о вашем заказе:\n' + summary, reply_markup=inline_markup)
    await state.finish()

@dp.message_handler(content_types=['web_app_data'])
async def web_app(message: types.Message):
    res = json.loads(message.web_app_data.data)
    formatted_message = ""
    
    for item in res:
        formatted_message += (
            f"Фото: {item['imgSrc']}\n"
            f"Имя: {item['title']}\n"
            f"Цена: {item['price']}\n"
            f"Кол-во: {item['quantity']}\n"
            f"Размер: {item['size']}\n"
            f"Цвет: {item['color']}\n"
            f"===================\n"
        )

    await send_data_to_telegram(formatted_message)
    await message.answer("Данные из корзины получены и отправлены в Telegram.")

@dp.message_handler(commands=['fetch_data'])
async def fetch_and_send_data(message: types.Message):
    website_data = await fetch_data_from_website()
    if website_data:
        await send_data_to_telegram(json.dumps(website_data, indent=4))
        await message.answer("Data fetched from the website sent to Telegram.")
    else:
        await message.answer("Failed to fetch data from the website.")

# Start polling
executor.start_polling(dp, skip_updates=True)
