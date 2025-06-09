import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import Header,Security,Depends
from transformers import pipeline
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from Database.connection import SessionSupabase
from Database.models import Prediction
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import bcrypt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
load_dotenv()


supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase_jwt= os.getenv("SUPABASE_JWT")
supabase_client: Client = create_client(supabase_url, supabase_key)

security = HTTPBearer()

def sign_up(email: str, password: str, username: str = None):
    try:
        # 1. Supabase Auth ile kayıt
        response = supabase_client.auth.sign_up({"email": email, "password": password})
        if not response.user:
            raise Exception("Supabase Auth kayıt başarısız.")
        # 2. Şifreyi hashle
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        # 3. Kendi users tablosuna ekle
        user_data = {
            "email": email,
            "username": username,
            "hashed_password": hashed_pw,
            "created_at": datetime.utcnow().isoformat()
        }
        supabase_client.table("users").insert(user_data).execute()
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Sign up failed: {e}")

def sign_in(email: str, password: str):
    try:
        response = supabase_client.auth.sign_in_with_password({"email": email, "password": password})
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Sign in failed: {e}")
def sign_out():
    try:
        response = supabase_client.auth.sign_out()
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Sign out failed: {e}")
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        user = supabase_client.auth.get_user(token)
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Geçersiz veya eksik token")

app = FastAPI()
roberta_pipe = pipeline("text-classification", model="roberta-base-openai-detector")

class AuthRequest(BaseModel):
    email: str = Field(..., description="Kullanıcı email adresi")
    password: str = Field(..., description="Kullanıcı şifresi")
    username: str = Field(None, description="Kullanıcı adı")

@app.post("/signup")
def sign_up_endpoint(auth: AuthRequest):
    return sign_up(auth.email, auth.password, auth.username)

@app.post("/signin")
def sign_in_endpoint(auth: AuthRequest):
    response = sign_in(auth.email, auth.password)
    access_token = response.session.access_token
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/signout")
def sign_out_endpoint():
    return sign_out()

class PredictionRequest(BaseModel):
    input_data: str = Field(..., description="Model için giriş verisi")

@app.post("/predict")
def predict(request: PredictionRequest, current_user=Depends(get_current_user)):
    try:
        user_id = current_user.user.id
        result = roberta_pipe(request.input_data)
        data = {
            "user_id": user_id,
            "model_name": "roberta-base-openai-detector",
            "input_data": request.input_data,
            "output_data": str(result),
            "created_at": datetime.utcnow().isoformat()
        }
        response = supabase_client.table("predictions").insert(data).execute()
        if response.status_code != 201:
            raise HTTPException(status_code=500, detail=f"Supabase insert error: {response.data}")
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")


