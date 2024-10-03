from utils import hash_password, verify_password, create_access_token, verify_access_token
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from bson import ObjectId
from pydantic import BaseModel, Field
from datetime import datetime
from os import getenv

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

app = FastAPI()

MONGODB_URL = getenv("MONGO_URL")
DB_NAME = getenv("MONGO_DB")

client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]

origins = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
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

class MemberData(BaseModel):
    id: str = Field(alias='_id')
    name: str
    password: str
    additional_info: dict = {}
    

@app.post("/login")
async def login(request: LoginRequest):
    try:
        room = await db.rooms.find_one({"_id": request.username}, {"password": True})
        if room is None:
            return JSONResponse(content={"message": "Record with _id does not exists"}, status_code=404)
        if verify_password(request.password, room["password"]):
            access_token = create_access_token(data={"sub": request.username})
            return {"access_token": access_token, "token_type": "bearer"}
        raise HTTPException(status_code=401, detail="Invalid username or password")
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

async def verify_access(token: str = Depends(oauth2_scheme)) -> str:
    token_data = verify_access_token(token)
    room_id = token_data.get('sub') 
    count = await db.rooms.count_documents({"_id": room_id})
    if count == 1:
        return room_id

    raise HTTPException(status_code=401, detail="Invalid token")
    

@app.get("/token/refresh")
async def refresh_token(room_id: str = Depends(verify_access)):
    print(f"LOG: accepted /refresh for {room_id} on", datetime.now().strftime(r"%Y-%m-%d %H:%M:%S"))
    access_token = create_access_token(data={"sub": room_id})
    return {"access_token": access_token, "token_type": "bearer"}


# ROOMS
@app.get("/sessions")
async def get_sessions(room_id: bool = Depends(verify_access)):
    payload = {"onGoing": None, "history": []}
    try:
        on_going = await db.rooms.find_one({"_id": room_id}, {"_id": False, "session_id": True})
        async for session in db.sessions.find({"room_id": room_id}, {"_id": True, "timestamp": True}):
            _id = session["_id"]
            session.pop("_id")
            if on_going["session_id"] == _id:
                payload["onGoing"] = session
            else:
                payload["history"].append(session)
        return payload
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.get("/rooms/{_id}")
async def get_rooms_info(_id: str, verified: bool = Depends(verify_access)):
    try:
        room = await db.rooms.find_one({"_id": _id}, {"password": False})
        if room is None:
            return JSONResponse(content={"message": "Record with _id does not exists"}, status_code=404)
        return room
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.delete("/rooms/{_id}")
async def delete_rooms(_id: str, verified: bool = Depends(verify_access)):
    try:
        result = await db.rooms.delete_one({"_id": _id})
        if result.deleted_count == 1:
            return {"message": f"Successfully deleted {_id}"}
        elif result.deleted_count == 0:
            return JSONResponse(content={"message": "Record with _id does not exists"}, status_code=404)
        else:
            raise ConnectionFailure
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

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
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)
    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)
    

# MEMBERS
@app.get("/members")
async def get_members(verified: bool = Depends(verify_access)):
    members = []
    try:
        async for _id in db.members.find({}, {"_id": True, "name": True}):
            members.append(_id)
        return members
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.get("/members/{_id}")
async def get_members_info(_id: str, verified: bool = Depends(verify_access)):
    try:
        member = await db.members.find_one({"_id": _id}, {"password": False})
        if member is None:
            return JSONResponse(content={"message": "Record with _id does not exists"}, status_code=404)
        return member
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.delete("/members/{_id}")
async def delete_members(_id: str, verified: bool = Depends(verify_access)):
    try:
        result = await db.members.delete_one({"_id": _id})
        if result.deleted_count == 1:
            return {"message": f"Successfully deleted {_id}"}
        elif result.deleted_count == 0:
            return JSONResponse(content={"message": "Record with _id does not exists"}, status_code=404)
        else:
            raise ConnectionFailure
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.post("/members")
async def add_batches(body: MemberData, verified: bool = Depends(verify_access)):
    try:
        existing_record = await db.members.find_one({"_id": body.id})
        if existing_record:
            return JSONResponse(content={"message": "Record with _id already exists"}, status_code=409)
        
        body = body.dict()
        body.update({"_id": body["id"]})
        body.pop("id")
        body["password"] = hash_password(body["password"])
        
        result = await db.members.insert_one(body)
        return JSONResponse(content={"message": "Data created successfully"}, status_code=201)
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)
    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)
