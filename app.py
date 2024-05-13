import requests
import os
from flask import Flask, request
from datetime import datetime

app = Flask(__name__)

# Токен телеграм бота
tg_bot_token = "6709308319:AAGRwA-HBuEtO7wVXIkwrl-dhHJ7pToHjFg"
# ID Чата
chat_id = "-1002037056729"

@app.route('/submit_form', methods=['POST'])
def submit_form():
    text = ''
    for key, val in request.form.items():
        text += f"{key}: {val}\n"

    text += f"\n{request.remote_addr}"
    text += f"\n{datetime.now().strftime('%d.%m.%y %H:%M:%S')}"

    # Добавляем ссылку на сайт для получения данных из корзины
    text += "\nКорзина: https://shukuril.github.io/php_bot/"

    # Отправка сообщения в телеграм
    url = f"https://api.telegram.org/bot{tg_bot_token}/sendMessage"
    params = {
        "chat_id": chat_id,
        "text": text
    }
    requests.post(url, data=params)

    # Отправка файлов в телеграм
    for file in request.files.values():
        url = f"https://api.telegram.org/bot{tg_bot_token}/sendDocument"

        file.save(file.filename)

        with open(file.filename, 'rb') as f:
            files = {'document': f}
            params = {"chat_id": chat_id}
            requests.post(url, files=files, data=params)

        os.remove(file.filename)

    # Ответ об успешном выполнении
    return '1'

if __name__ == '__main__':
    app.run(debug=True)
