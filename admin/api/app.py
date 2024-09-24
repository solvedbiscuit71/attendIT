from utils import hash_password, verify_password, create_access_token, verify_access_token
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, Field

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

app = FastAPI()

MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "attendIT"

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DB_NAME]

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str
    
class RoomData(BaseModel):
    id: str = Field(alias='_id')
    password: str
    additional_info: dict = {}

CORRECT_USERNAME = "admin"
CORRECT_PASSWORD = hash_password("password123")

@app.post("/login")
async def login(request: LoginRequest):
    if request.username == CORRECT_USERNAME and verify_password(request.password, CORRECT_PASSWORD):
        access_token = create_access_token(data={"sub": request.username})
        return {"access_token": access_token, "token_type": "bearer"}
    
    raise HTTPException(status_code=401, detail="Invalid username or password")


async def verify_access(token: str = Depends(oauth2_scheme)) -> bool:
    token_data = verify_access_token(token)
    if token_data.get('sub') == CORRECT_USERNAME:
        return True
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.get("/rooms")
async def get_rooms(verified: bool = Depends(verify_access)):
    rooms_id = []
    async for _id in db.rooms.find({}, {"_id": True}):
        rooms_id.append(_id)
    return rooms_id

@app.post("/rooms")
async def add_rooms(body: RoomData, verified: bool = Depends(verify_access)):
    try:
        existing_record = await db.rooms.find_one({"_id": body.id})
        if existing_record:
            return JSONResponse(content={"message": "Record with _id already exists"}, status_code=409)
        
        body = body.dict()
        body.update({"_id": body["id"]})
        body.pop("id")
        body["password"] = hash_password(body["password"])
        result = await db.rooms.insert_one(body)
        return JSONResponse(content={"message": "Data created successfully"}, status_code=201)
    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)