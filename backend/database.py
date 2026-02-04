from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client[os.getenv("DB_NAME")]

jobs = db["jobs"]
profiles = db["profiles_scraped"]
approved = db["approved"]
users = db["users"]
schedules = db["schedules"]