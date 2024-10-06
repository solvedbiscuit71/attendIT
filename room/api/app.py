from utils import hash_password, verify_password, create_access_token, verify_access_token
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure, DuplicateKeyError
from bson import ObjectId
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
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

class SessionData(BaseModel):
    # (room_id, timestamp) should be unique
    member_ids: list[str]
    expires_at: int
    additional_info: dict = {}
    
class CheckpointData(BaseModel):
    name: str
    expires_at: int

@app.post("/login")
async def login(request: LoginRequest):
    try:
        room = await db.rooms.find_one({"_id": request.username}, {"password": True})
        if room is None:
            return JSONResponse(content={"message": "Room with _id does not exists"}, status_code=404)
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


# SESSIONS
@app.get("/sessions")
async def get_sessions(room_id: str = Depends(verify_access)):
    payload = {"onGoing": None, "history": []}
    try:
        async for session in db.sessions.find({"room_id": room_id}, {"_id": True, "timestamp": True, "ongoing": True}):
            _id = session["_id"]
            session["_id"] = str(_id)
            if session["ongoing"]:
                payload["onGoing"] = session
            else:
                payload["history"].append(session)
        return payload
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

@app.post("/sessions")
async def add_sessions(body: SessionData, room_id: str = Depends(verify_access)):
    try:
        room = await db.rooms.find_one({"_id": room_id}, {"_id": False, "ongoing_session_id": True})
        ongoing_session_id = room["ongoing_session_id"]

        if ongoing_session_id is not None:
            return JSONResponse(content={"message": "Data creation failed"}, status_code=409)
        
        member_count = 0
        async for member in db.members.find({"_id": {"$in": body.member_ids}}):
            member_count += 1
            if member["ongoing_session_id"] is not None:
                return JSONResponse(content={"message": "Data creation failed"}, status_code=409)
        
        if member_count != len(body.member_ids):
            return JSONResponse(content={"message": "Invalid member ids"}, status_code=400)

        timestamp = datetime.utcnow().replace(microsecond=0)
        session = {
            "room_id": room_id,
            "timestamp": timestamp,
            "entry_expires_at": timestamp + timedelta(minutes=body.expires_at),
            "ongoing": True,
            "additional_info": body.additional_info
        }
        
        result = await db.sessions.insert_one(session)
        session_id = result.inserted_id
        result = await db.rooms.update_one({"_id": room_id}, {"$set": {"ongoing_session_id": session_id}})
        result = await db.members.update_many({"_id": {"$in": body.member_ids}}, {"$set": {"ongoing_session_id": session_id}})
        
        members_sessions = []
        for member_id in body.member_ids:
            members_sessions.append({
                "session_id": session_id,
                "member_id": member_id,
                "entry": False,
                "checkpoint_ids": []
            })
        result = await db.members_sessions.insert_many(members_sessions)

        return JSONResponse(content={"message": "Data created successfully"}, status_code=201)
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)
    
def remove_keys(body, keys):
    for key in keys:
        try:
            body.pop(key)
        except KeyError:
            continue
    return body

@app.get("/sessions/{session_id}")
async def get_sessions_info(session_id: str, room_id: str = Depends(verify_access)):
    """
    Returns {
        session_id: string;
        room_id: string;
        timestamp: string;
        entry_expires_at: string;
        checkpoints: {
            name: string;
            expires_at: string;
        }[];
        ongoing: boolean;
        additional_info: { ... };
        attendees: {
            member_id: string;
            entry: boolean;
            checkpoint_ids: string[];
        }[];
    }
    """
    try:
        session_id = ObjectId(session_id)
        session = await db.sessions.find_one({"_id": session_id, "room_id": room_id})
        if session is None:
            return JSONResponse(content={"message": "Session with _id does not exists"}, status_code=404)

        attendees = await db.members_sessions.find({"session_id": session_id}).to_list(length=None)
        checkpoints = await db.sessions_checkpoints.find({"session_id": session_id}).to_list(length=None)

        session["session_id"] = str(session["_id"])
        session = remove_keys(session, ["_id"])
        session["attendees"] = list(map(lambda x: remove_keys(x, ["_id", "session_id"]), attendees))
        session["checkpoints"] = list(map(lambda x: remove_keys(x, ["_id", "session_id"]), checkpoints))
        return session
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)
    
@app.patch("/sessions/{session_id}/end")
async def end_session(session_id: str, room_id: str = Depends(verify_access)):
    try:
        session_id = ObjectId(session_id)
        session = await db.sessions.find_one({"_id": session_id, "room_id": room_id}, {"ongoing": True})
        if not session["ongoing"]:
            return JSONResponse(content={"message": "Session Already Ended."}, status_code=400)

        members_sessions = await db.members_sessions.find({"session_id": session_id}, {"_id": False, "member_id": True}).to_list(length=None)
        member_ids = list(map(lambda x: x["member_id"], members_sessions))
        
        result = await db.rooms.update_one({"_id": room_id}, {"$set": {"ongoing_session_id": None}})
        result = await db.members.update_many({"_id": {"$in": member_ids}}, {"$set": {"ongoing_session_id": None}})
        result = await db.sessions.update_one({"_id": session_id}, {"$set": {"ongoing": False}})
        return {"message": f"Successfully Ended Session {session_id}"}
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)
    
@app.post("/sessions/{session_id}/checkpoint")
async def add_checkpoint(body: CheckpointData, session_id: str, room_id: str = Depends(verify_access)):
    try:
        session_id = ObjectId(session_id)
        session = await db.sessions.find_one({"_id": session_id, "room_id": room_id}, {"ongoing": True})
        if not session["ongoing"]:
            return JSONResponse(content={"message": "Session Already Ended."}, status_code=400)
        
        timestamp = datetime.utcnow().replace(microsecond=0)
        checkpoint = {
            "session_id": session_id,
            "name": body.name,
            "expires_at": timestamp + timedelta(minutes=body.expires_at)
        }
        
        result = await db.sessions_checkpoints.insert_one(checkpoint)
        print(result)
        return {"message": f"Checkpoint created successfully"}

    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)
    
    except DuplicateKeyError:
        return JSONResponse(content={"message": f"Checkpoint {body.name} already exists"}, status_code=409)

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str, room_id: str = Depends(verify_access)):
    try:
        session_id = ObjectId(session_id)
        session = await db.sessions.find_one({"_id": session_id, "room_id": room_id}, {"ongoing": True})
        if session is None:
            return JSONResponse(content={"message": "Session with _id does not exists"}, status_code=404)
        if session["ongoing"]:
            return JSONResponse(content={"message": "Cannot Delete Ongoing Session"}, status_code=400)

        result = await db.sessions.delete_one({"_id": session_id})
        if result.deleted_count == 1:
            result = await db.members_sessions.delete_many({"session_id": session_id})
            result = await db.sessions_checkpoints.delete_many({"session_id": session_id})
            return {"message": f"Successfully Deleted Session {session_id}"}
        elif result.deleted_count == 0:
            return JSONResponse(content={"message": "Session with _id does not exists"}, status_code=404)
        else:
            raise ConnectionFailure
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)

# MEMBERS
@app.get("/members")
async def get_members(verified: bool = Depends(verify_access)):
    members = []
    try:
        async for member in db.members.find({}, {"_id": True, "name": True, "ongoing_session_id": True}):
            if member["ongoing_session_id"] is not None:
                member["ongoing_session_id"] = str(member["ongoing_session_id"])
            members.append(member)
        return members
    except (ServerSelectionTimeoutError, ConnectionFailure) as e:
        return JSONResponse(content={"message": "Database Failure"}, status_code=500)