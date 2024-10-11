import os
import json
import numpy as np
import face_recognition

from utils import hash_password, verify_password, create_access_token, verify_access_token
from fastapi import FastAPI, HTTPException, Depends, Form, UploadFile
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from bson import ObjectId
from pydantic import BaseModel, Field
from datetime import datetime
from PIL import Image, ImageOps

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

app = FastAPI()

MONGODB_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("MONGO_DB")

client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
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
    ongoing_session_id: str | None = None
    additional_info: dict = {}
    
class RoomPatchData(BaseModel):
    password: str | None = None
    additional_info: dict = {}

CORRECT_USERNAME = os.getenv("CORRECT_USERNAME")
CORRECT_PASSWORD = hash_password(os.getenv("CORRECT_PASSWORD"))


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
    raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/token/refresh")
async def refresh_token(verified: bool = Depends(verify_access)):
    print("LOG: accepted /refresh on", datetime.now().strftime(r"%Y-%m-%d %H:%M:%S"))
    access_token = create_access_token(data={"sub": CORRECT_USERNAME})
    return {"access_token": access_token, "token_type": "bearer"}


# ROOMS
@app.get("/rooms")
async def get_rooms(verified: bool = Depends(verify_access)):
    rooms_id = []
    try:
        async for _id in db.rooms.find({}, {"_id": True}):
            rooms_id.append(_id)
        return rooms_id
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.get("/rooms/{_id}")
async def get_rooms_info(_id: str, verified: bool = Depends(verify_access)):
    try:
        room = await db.rooms.find_one({"_id": _id}, {"password": False})
        if room is None:
            return JSONResponse(content={"message": "Record with _id does not exists"}, status_code=404)
        if room["ongoing_session_id"] is not None:
            room["ongoing_session_id"] = str(room["ongoing_session_id"])
        return room
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.delete("/rooms/{room_id}")
async def delete_rooms(room_id: str, verified: bool = Depends(verify_access)):
    try:
        room = await db.rooms.find_one({"_id": room_id}, {"ongoing_session_id": True})
        if room is None:
            return JSONResponse(content={"message": "Room with _id does not exists"}, status_code=404)
        if room["ongoing_session_id"] is None:
            session_ids = await db.sessions.find({"room_id": room_id}, {"_id": True}).to_list(length=None)
            session_ids = list(map(lambda doc: doc['_id'], session_ids))

            await db.sessions_checkpoints.delete_many({"session_id": {"$in": session_ids}})
            await db.members_sessions.delete_many({"session_id": {"$in": session_ids}})
            await db.sessions.delete_many({"_id": {"$in": session_ids}})
            await db.rooms.delete_one({"_id": room_id})
        else:
            return JSONResponse(content={"message": "Room has ongoing session"}, status_code=400)
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.patch("/rooms/{_id}")
async def update_rooms(body: RoomPatchData, _id: str, verified: bool = Depends(verify_access)):
    try:
        room = await db.rooms.find_one({"_id": _id}, {"_id": True})
        if room is None:
            return JSONResponse(content={"message": "Room with _id does not exists"}, status_code=404)
        
        update = {}
        if body.password:
            update['password'] = hash_password(body.password)
        if body.additional_info:
            update['additional_info'] = body.additional_info
        
        if update:
            await db.rooms.update_one({"_id": _id}, {"$set": update})
            return {"message": "successfully updated"}
        return {"message": "no update received"}

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
        await db.rooms.insert_one(body)
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
        member = await db.members.find_one({"_id": _id}, {"password": False, "encoding": False})
        if member is None:
            return JSONResponse(content={"message": "Record with _id does not exists"}, status_code=404)
        if member["ongoing_session_id"] is not None:
            member["ongoing_session_id"] = str(member["ongoing_session_id"])
        return member
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.delete("/members/{_id}")
async def delete_members(_id: str, verified: bool = Depends(verify_access)):
    try:
        result = await db.members.delete_one({"_id": _id})
        # TODO: delete members_sessions associated with member
        if result.deleted_count == 1:
            return {"message": f"Successfully deleted {_id}"}
        elif result.deleted_count == 0:
            return JSONResponse(content={"message": "Record with _id does not exists"}, status_code=404)
        else:
            raise ConnectionFailure
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.post("/members")
async def add_members(image: UploadFile, member_id: str = Form(alias="_id"), name: str = Form(), password: str = Form(), additional_info: str = Form(), verified: bool = Depends(verify_access)):
    try:
        existing_record = await db.members.find_one({"_id": member_id})
        if existing_record:
            return JSONResponse(content={"message": "Record with _id already exists"}, status_code=409)
        
        _, extension = image.content_type.split('/')
        filename = f'tmp.{extension}'
        with open(filename, 'wb') as file:
            content = await image.read()
            file.write(content)
            
        unknown_image = Image.open(filename)
        unknown_image = ImageOps.exif_transpose(unknown_image)

        width, height = unknown_image.size

        new_width = int(width * 0.25)
        new_height = int(height * 0.25)

        unknown_image = unknown_image.resize((new_width, new_height))
        unknown_image = np.array(unknown_image)

        face_locations = face_recognition.face_locations(unknown_image)
        unknown_encoding = face_recognition.face_encodings(unknown_image, face_locations)

        if len(face_locations) == 0:
            print("[LOG] No faces detected")
            return JSONResponse(content={"message": "No face detected"}, status_code=406)
        
        if len(face_locations) > 1:
            print("[LOG] More than one face detected")
            return JSONResponse(content={"message": "More than one face detected"}, status_code=406)
        
        body = {
            "_id": member_id,
            "name": name,
            "password": hash_password(password),
            "ongoing_session_id": None,
            "additional_info": json.loads(additional_info),
            "encoding": unknown_encoding[0].tobytes(),
        }
        result = await db.members.insert_one(body)
        return JSONResponse(content={"message": "Data created successfully"}, status_code=201)
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)
