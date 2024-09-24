from utils import hash_password, verify_password, create_access_token, verify_access_token
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

app = FastAPI()

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

CORRECT_USERNAME = "admin"
CORRECT_PASSWORD = hash_password("password123")

async def verify_access(token: str = Depends(oauth2_scheme)):
    token_data = verify_access_token(token)
    if token_data.get('sub') == CORRECT_USERNAME:
        return True
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.post("/login")
async def login(request: LoginRequest):
    if request.username == CORRECT_USERNAME and verify_password(request.password, CORRECT_PASSWORD):
        access_token = create_access_token(data={"sub": request.username})
        return {"access_token": access_token, "token_type": "bearer"}
    
    raise HTTPException(status_code=401, detail="Invalid username or password")