# --- main.py ---
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import Depends, FastAPI, HTTPException, File, UploadFile
import traceback
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
import ast
from supabase import create_client, Client
from postgrest.exceptions import APIError
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

# FastAPI App Initialization
app = FastAPI()

# CORS Middleware Configuration
from fastapi.middleware.cors import CORSMiddleware

# Get the frontend URL from environment variables, with a default for local development
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

origins = [
    FRONTEND_URL,
    "http://localhost:3000",  # Common React dev port
    "http://localhost:5173",  # Vite default port
    # Add any other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # More secure to list specific origins
    allow_credentials=True,
    allow_methods=["*"],      # Allows all methods
    allow_headers=["*"],      # Allows all headers
)

# Supabase Client Initialization
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise Exception("Supabase URL and Key must be set in .env file")
supabase_client: Client = create_client(supabase_url, supabase_key)

# ML Model Loading
roberta_pipe = pipeline("text-classification", model="roberta-base-openai-detector")

# --- Utility functions ---
def clean_text(text: str) -> str:
    """Normalize whitespace, remove hyphenated line breaks, collapse multiple spaces."""
    text = text.replace('\n', ' ')
    text = re.sub(r'-\s+', '', text)  # join words broken with hyphen + newline/space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# --- Pydantic Models ---

class AuthRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    username: Optional[str] = None

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class AccuracyResponse(BaseModel):
    accuracy: float

class PredictionRequest(BaseModel):
    input_text: str

class FeedbackCreate(BaseModel):
    prediction_id: UUID
    is_correct: bool
    comment: Optional[str] = None

class AppUser(BaseModel):
    id: UUID
    username: Optional[str] = None
    email: EmailStr
    role: str
    created_at: datetime
    updated_at: Optional[datetime] = None

# Base class for prediction fields to handle data transformation from DB
class PredictionBase(BaseModel):
    id: UUID
    user_id: UUID
    input_data: str  # Matches DB column name
    output_data: Dict[str, Any]
    created_at: Optional[datetime] = None # Make optional to handle potential nulls from DB
    model_name: Optional[str] = None

    @field_validator('output_data', mode='before')
    @classmethod
    def parse_output_data(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                # Safely evaluate the string representation of the list/dict
                data = ast.literal_eval(v)
                # The model expects a dict, but pipeline returns a list with one dict
                if isinstance(data, list) and len(data) > 0:
                    return data[0]
                return data
            except (ValueError, SyntaxError):
                # Return an empty dict if it's not a valid literal
                return {}
        return v

class Prediction(PredictionBase):
    feedback_is_correct: Optional[bool] = None
    feedback_created_at: Optional[datetime] = None
    feedback_comment: Optional[str] = None

class UserAdminView(BaseModel):
    id: UUID
    email: EmailStr
    username: Optional[str]
    role: str
    created_at: datetime

class PredictionAdminView(PredictionBase):
    user_email: Optional[EmailStr] = None

# --- Authentication Dependencies ---

http_bearer = HTTPBearer()

async def get_current_user_auth(credentials: HTTPAuthorizationCredentials = Depends(http_bearer)):
    token = credentials.credentials
    try:
        response = supabase_client.auth.get_user(token)
        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

async def get_current_app_user(user_auth: Any = Depends(get_current_user_auth)) -> AppUser:
    user_id = str(user_auth.id)
    
    # Try to fetch the user profile
    # Select all columns to ensure the data matches the AppUser model completely.
    profile_res = supabase_client.table("app_users").select("*").eq("id", user_id).execute()

    # If profile exists, return it
    if profile_res.data:
        return AppUser(**profile_res.data[0])
    
    # If profile does not exist for an authenticated user, create it.
    # This handles data inconsistency between auth.users and our public app_users table.
    else:
        new_user_data = {
            "id": user_id,
            "email": user_auth.email,
            "role": "user"  # Default to 'user'. Admins should be managed carefully.
        }
        try:
            # Step 1: Insert the new user with basic info.
            supabase_client.table("app_users").insert(new_user_data).execute()
            
            # Step 2: Immediately re-fetch the complete user record. This is crucial
            # to get all fields, especially those set by DB defaults (like created_at).
            # Using .single() is safe here because we know the record was just created.
            new_profile_res = supabase_client.table("app_users").select("*").eq("id", user_id).single().execute()

            if not new_profile_res.data:
                raise HTTPException(status_code=500, detail="Critical error: Failed to retrieve user profile immediately after creation.")

            # Step 3: Now, with the complete data, create the user model.
            return AppUser(**new_profile_res.data)

        except Exception as e:
            # Print the full traceback to the console for debugging
            print("--- DETAILED ERROR TRACEBACK ---")
            traceback.print_exc()
            print("----------------------------------")
            # Catch potential DB errors during insert or select
            raise HTTPException(status_code=500, detail=f"Database error during profile auto-creation: {str(e)}")

def require_admin(current_user: AppUser = Depends(get_current_app_user)):
    # Strip whitespace and quotes (' and ") from the role before comparing
    if not current_user.role or current_user.role.strip().strip('\'"').lower() != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    return current_user

# --- API Endpoints ---

@app.get("/users/me", response_model=AppUser)
async def read_users_me(current_user: AppUser = Depends(get_current_app_user)):
    return current_user

@app.post("/signup", status_code=201)
def sign_up_endpoint(request: AuthRequest):
    try:
        auth_response = supabase_client.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {"email_confirm": False} # Set to True in production
        })
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Could not create user in authentication system.")

        user_id = auth_response.user.id
        user_data = {
            "id": str(user_id),
            "email": request.email,
            "username": request.username,
            "role": "user"
        }
        insert_response = supabase_client.from_("app_users").insert(user_data).execute()

        if getattr(insert_response, 'error', None):
            supabase_client.auth.admin.delete_user(user_id)
            raise HTTPException(status_code=500, detail=f"Failed to create user profile: {insert_response.error.message}")

        return {"message": "User created successfully. Please sign in."}

    except Exception as e:
        if "already registered" in str(e).lower():
            raise HTTPException(status_code=409, detail="Email already registered")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/signin", response_model=TokenResponse)
async def sign_in_user(request: SignInRequest):
    try:
        response = supabase_client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        if not response.session:
            raise HTTPException(status_code=401, detail="Invalid login credentials")

        user_id = response.user.id
        # Fetch role from 'app_users' table. It's possible a user exists in auth but not here.
        # Removed .single() to prevent crashing if no row is found.
        profile_res = supabase_client.from_("app_users").select("role").eq("id", user_id).execute()
        
        user_role = "user" # Default role
        # The result is now a list, so we check if it's not empty.
        if profile_res.data:
            # Safely get the role from the first record.
            user_role = profile_res.data[0].get("role", "user")

        return TokenResponse(
            access_token=response.session.access_token,
            role=user_role
        )
    except Exception as e:
        if "invalid login credentials" in str(e).lower():
             raise HTTPException(status_code=401, detail="Invalid login credentials")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/signout")
def sign_out_endpoint(credentials: HTTPAuthorizationCredentials = Depends(http_bearer)):
    try:
        token = credentials.credentials
        supabase_client.auth.sign_out(token)
        return {"message": "Signed out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sign out failed: {e}")

@app.post("/predict")
async def predict(request: PredictionRequest, current_user: AppUser = Depends(get_current_app_user)):
    try:
        cleaned = clean_text(request.input_text)
        capped = cleaned[:5000]
        # DEBUG: print first 300 chars for comparison
        print("/predict capped text:", capped[:300])
        prediction_result = roberta_pipe(capped, truncation=True, max_length=512)
        
        prediction_data = {
            "user_id": str(current_user.id),
            "input_data": capped,
            "output_data": str(prediction_result),
            "model_name": "roberta-base-openai-detector"
        }

        response = supabase_client.table("predictions").insert(prediction_data).execute()

        if getattr(response, 'error', None):
            raise HTTPException(status_code=500, detail=f"Failed to save prediction: {response.error.message}")

        # The ID from the response is a UUID string, so we return it directly
        return {"prediction": prediction_result, "id": response.data[0]['id']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predictions/me", response_model=List[Prediction])
async def get_user_predictions(current_user: AppUser = Depends(get_current_app_user)):
    try:
        # Step 1: Fetch all predictions for the current user
        predictions_response = supabase_client.table("predictions").select("*").eq("user_id", str(current_user.id)).order("created_at", desc=True).execute()
        
        if getattr(predictions_response, 'error', None):
            raise APIError(predictions_response.error.dict())

        predictions = predictions_response.data
        if not predictions:
            return []

        prediction_ids = [p['id'] for p in predictions]

        # Step 2: Fetch feedbacks using the correct column name 'prediction_id'
        feedbacks_response = supabase_client.table("feedbacks").select("prediction_id, is_correct, created_at, content").in_("prediction_id", prediction_ids).execute()

        if getattr(feedbacks_response, 'error', None):
            print(f"Warning: Could not fetch feedbacks. {feedbacks_response.error.message}")
            feedbacks_map = {}
        else:
            # Step 3: Create a lookup map (prediction_id -> feedback)
            feedbacks_map = {f['prediction_id']: f for f in feedbacks_response.data}

        # Step 4: Merge feedback data into predictions
        for p in predictions:
            feedback_info = feedbacks_map.get(p['id'])
            if feedback_info:
                p['feedback_is_correct'] = feedback_info.get('is_correct')
                p['feedback_created_at'] = feedback_info.get('created_at')
                # Map 'content' from DB to 'feedback_comment' in response model
                p['feedback_comment'] = feedback_info.get('content')
            else:
                p['feedback_is_correct'] = None
                p['feedback_created_at'] = None
                p['feedback_comment'] = None
        
        return predictions

    except APIError as e:
        print(f"APIError in get_user_predictions: {e}")
        raise HTTPException(status_code=500, detail=e.message or "An error occurred while fetching predictions.")
    except Exception as e:
        import traceback
        print(f"Exception in get_user_predictions: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/feedback-count", dependencies=[Depends(require_admin)])
async def get_feedback_count():
    try:
        response = supabase_client.table("feedbacks").select("id", count='exact').execute()
        return {"count": response.count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prediction-count", dependencies=[Depends(require_admin)])
async def get_prediction_count():
    try:
        response = supabase_client.table("predictions").select("id", count='exact').execute()
        return {"count": response.count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prediction-accuracy", response_model=AccuracyResponse, dependencies=[Depends(require_admin)])
async def get_prediction_accuracy():
    try:
        # Calculate accuracy based on the feedbacks table
        # Get total number of feedbacks
        total_feedback_res = supabase_client.table("feedbacks").select("id", count='exact').execute()
        total_feedbacks = total_feedback_res.count

        if total_feedbacks == 0:
            return AccuracyResponse(accuracy=0)

        # Get number of correct feedbacks
        correct_feedback_res = supabase_client.table("feedbacks").select("id", count='exact').eq('is_correct', True).execute()
        correct_feedbacks = correct_feedback_res.count

        accuracy = correct_feedbacks / total_feedbacks
        return AccuracyResponse(accuracy=accuracy)

    except Exception as e:
        # Log the exception for debugging purposes
        print(f"Error in /prediction-accuracy: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prediction-history", dependencies=[Depends(require_admin)])
async def get_prediction_history():
    try:
        # Select 'output_data' instead of the non-existent 'prediction' column
        response = supabase_client.from_("predictions").select("created_at, output_data").order("created_at", desc=False).execute()
        
        history = []
        if response.data:
            for item in response.data:
                date_str = item['created_at']
                date = date_str.split('T')[0]
                
                prediction_label = None
                output_data_str = item.get('output_data')
                
                if output_data_str:
                    try:
                        # Safely evaluate the string e.g., "[{'label': 'Fake', 'score': ...}]"
                        output_list = ast.literal_eval(output_data_str)
                        if isinstance(output_list, list) and len(output_list) > 0:
                            # Get the label and convert to lowercase for consistent comparison
                            prediction_label = output_list[0].get('label', '').lower()
                    except (ValueError, SyntaxError):
                        # Ignore malformed data
                        continue
                
                if prediction_label:
                    history.append({"date": date, "prediction": prediction_label})
        
        # Aggregate counts per day
        daily_summary = {}
        for record in history:
            date = record['date']
            pred = record['prediction'] # pred will be 'real' or 'fake' in lowercase
            if date not in daily_summary:
                daily_summary[date] = {'real': 0, 'fake': 0}
            
            if pred == 'real':
                daily_summary[date]['real'] += 1
            elif pred == 'fake':
                daily_summary[date]['fake'] += 1

        # Format for chart
        chart_data = [
            {"date": date, "real": counts['real'], "fake": counts['fake']} 
            for date, counts in daily_summary.items()
        ]
        chart_data.sort(key=lambda x: x['date'])

        return chart_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit-feedback")
async def submit_user_feedback(feedback: FeedbackCreate, current_user: AppUser = Depends(get_current_app_user)):
    try:
        feedback_data = {
            "id": str(uuid4()),
            "prediction_id": str(feedback.prediction_id),
            "user_id": str(current_user.id),
            "is_correct": feedback.is_correct,
        }
        # Supabase 'content' column is NOT NULL; use empty string if comment missing
        feedback_data["content"] = feedback.comment if feedback.comment is not None else ""
        print("Submitting feedback:", feedback_data)  # DEBUG

        response = supabase_client.table("feedbacks").insert(feedback_data).execute()
        if getattr(response, 'error', None):
            print("Supabase insert error:", response.error)  # DEBUG
            raise HTTPException(status_code=500, detail=f"Supabase error: {response.error.message}")
        if not response.data:
            raise HTTPException(status_code=500, detail="Insert succeeded but no data returned")
        return response.data[0]
    except Exception as e:
        import traceback, json
        print("Submit feedback exception:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-pdf")
async def predict_pdf(file: UploadFile = File(...), current_user: AppUser = Depends(get_current_app_user)):
    try:
        import PyPDF2, io
        pdf_bytes = await file.read()
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = " ".join([page.extract_text() or "" for page in reader.pages])
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="PDF içeriği okunamadı veya boş.")
        cleaned = clean_text(extracted_text)
        capped = cleaned[:5000]
        # DEBUG: print first 300 chars for comparison
        print("/predict-pdf capped text:", capped[:300])
        prediction_result = roberta_pipe(capped, truncation=True, max_length=512)
        prediction_data = {
            "user_id": str(current_user.id),
            "input_data": capped,
            "output_data": str(prediction_result),
            "model_name": "roberta-base-openai-detector"
        }
        response = supabase_client.table("predictions").insert(prediction_data).execute()
        if getattr(response, 'error', None):
            raise HTTPException(status_code=500, detail=f"Failed to save prediction: {response.error.message}")
        return {"prediction": prediction_result, "id": response.data[0]['id']}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Admin Endpoints ---

@app.get("/admin/users", response_model=List[UserAdminView], dependencies=[Depends(require_admin)])
async def list_users():
    try:
        response = supabase_client.table("app_users").select("*").order("created_at", desc=True).execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/predictions", response_model=List[PredictionAdminView], dependencies=[Depends(require_admin)])
async def list_predictions() -> List[PredictionAdminView]:
    try:
        # Adjust the select query to fetch user email via a foreign key relationship
        # This assumes 'app_users' is the related table and the foreign key is set up.
        preds_res = supabase_client.table("predictions").select("*, app_users(email)").order("created_at", desc=True).execute()

        if not preds_res.data:
            return []

        # Process data to flatten the nested user email
        processed_data = []
        for pred in preds_res.data:
            if 'app_users' in pred and pred['app_users']:
                pred['user_email'] = pred['app_users']['email']
            else:
                pred['user_email'] = None # Handle case where user might be deleted
            del pred['app_users'] # Clean up the nested dict
            processed_data.append(pred)

        return [PredictionAdminView(**p) for p in processed_data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
