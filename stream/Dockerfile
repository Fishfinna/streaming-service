FROM python:3.8

#app configuration
WORKDIR /app
RUN pip install flask mysql-connector-python pymysql tenacity

#copy in the application file
COPY . .

#system startup
EXPOSE 5000
CMD ["python", "app.py"]
