from aiohttp import web
import aiohttp
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.contrib.middlewares.logging import LoggingMiddleware
from aiogram.utils import executor

API_TOKEN = '6709308319:AAGRwA-HBuEtO7wVXIkwrl-dhHJ7pToHjFg'  # Укажите свой токен API от BotFather

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)
app = web.Application()

# Эндпоинт для приема данных от клиента
async def submit_order(request):
    data = await request.json()

    name = data['name']
    phone = data['phone']
    address = data['address']
    items = data['items']

    # Отправка данных в AIogram
    await bot.send_message(chat_id='-1002037056729', text=f'New Order:\nName: {name}\nPhone: {phone}\nAddress: {address}')

    for item in items:
        title = item['title']
        price = item['price']
        quantity = item['quantity']
        product_img = item['productImg']
        size = item['size']
        color = item['color']
        product_id = item['productId']

        message = f'Product: {title}\nPrice: {price}\nQuantity: {quantity}\nSize: {size}\nColor: {color}\nProduct ID: {product_id}\n\n'
        await bot.send_message(chat_id='your_chat_id', text=message)

    return web.json_response({'status': 'ok'})

app.router.add_post('/submit_order', submit_order)

# Запуск сервера
async def on_startup(app):
    await bot.send_message(chat_id='-1002037056729', text="Server started")

async def on_shutdown(app):
    await bot.send_message(chat_id='-1002037056729', text="Server stopped")

app.on_startup.append(on_startup)
app.on_shutdown.append(on_shutdown)

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
    web.run_app(app, host='localhost', port=8080)
