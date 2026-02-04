from fastapi import FastAPI, HTTPException, Depends, Header
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from .database import jobs, profiles, approved, users, schedules
from .auth import hash_password, verify_password, create_access_token, decode_token, create_n8n_token
from dotenv import load_dotenv
from datetime import datetime, timedelta
import resend
from bson import ObjectId
import os
import httpx
import secrets
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI()
scheduler = AsyncIOScheduler()
scheduler.start()

N8N_ACQ = os.getenv("N8N_ACQUISITION_WEBHOOK")
N8N_SEND = os.getenv("N8N_SEND_WEBHOOK")
N8N_SECRET = os.getenv("N8N_JWT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL")

@app.on_event("startup")
async def load_existing_schedules():
    active = await schedules.find({"isActive": True}).to_list(100)

    for sched in active:
        sched["_id"] = str(sched["_id"])
        await register_schedule_job(sched)


# ---------------- CORS ---------------- #

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------- AUTH ---------------- #

async def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
        payload = decode_token(token)
        return payload["email"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/auth/signup")
async def signup(data: dict):
    existing = await users.find_one({"email": data["email"]})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in instead.")

    await users.insert_one({
        "email": data["email"],
        "password": hash_password(data["password"]),
        "fullName": "",
        "company": "",
        "createdAt": datetime.utcnow(),
        "isActive": True,
        "resetToken": None,
        "resetTokenExpiry": None
    })

    return {"message": "User created"}


@app.post("/auth/login")
async def login(data: dict):
    user = await users.find_one({"email": data["email"]})

    if not user or not verify_password(data["password"], user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"email": user["email"]})
    return {"access_token": token}


# ---------------- PIPELINE START ---------------- #


# ---- helper that actually runs pipeline ----
async def trigger_pipeline_internal():

    latest = await jobs.find_one({}, sort=[("id", -1)])

    if latest and latest.get("status") == "running":
        return  # silently skip if already running

    n8n_token = create_n8n_token({
        "service": "fastapi",
        "type": "pipeline_start"
    })

    async with httpx.AsyncClient(timeout=300) as client:
        await client.post(
            N8N_ACQ,
            headers={
                "Authorization": f"Bearer {n8n_token}"
            }
        )

# ---- helper that registers a schedule ----
async def register_schedule_job(schedule_doc):

    schedule_id = str(schedule_doc["_id"])

    async def job_wrapper():
        await trigger_pipeline_internal()

        # If one-time job, deactivate after running
        if schedule_doc["type"] == "one_time":
            await schedules.update_one(
                {"_id": schedule_doc["_id"]},
                {"$set": {"isActive": False}}
            )
            scheduler.remove_job(schedule_id)

    if schedule_doc["type"] == "one_time":

        trigger = DateTrigger(run_date=schedule_doc["runAt"])

        scheduler.add_job(
            job_wrapper,
            trigger=trigger,
            id=schedule_id,
            replace_existing=True
        )

    elif schedule_doc["type"] == "recurring":

        trigger = CronTrigger.from_crontab(schedule_doc["cron"])

        scheduler.add_job(
            job_wrapper,
            trigger=trigger,
            id=schedule_id,
            replace_existing=True
        )


@app.post("/pipeline/start")
async def start_pipeline(user=Depends(get_current_user)):

    latest = await jobs.find_one({}, sort=[("id", -1)])

    if latest and latest.get("status") == "running":
        raise HTTPException(status_code=400, detail="Pipeline already running")

    await trigger_pipeline_internal()

    return {"message": "Pipeline started"}


# ----------------------------CREATE SCHEDULE-------------------------------#
@app.post("/pipeline/schedule")
async def create_schedule(data: dict, user=Depends(get_current_user)):
    """
    data:
    {
        "type": "one_time" | "recurring",
        "runAt": "2026-01-31T09:00:00Z",   # for one_time
        "cron": "0 9 * * *"               # for recurring
    }
    """

    schedule_type = data.get("type")

    if schedule_type not in ["one_time", "recurring"]:
        raise HTTPException(status_code=400, detail="Invalid schedule type")

    doc = {
        "userEmail": user,
        "type": schedule_type,
        "isActive": True,
        "createdAt": datetime.utcnow()
    }

    if schedule_type == "one_time":
        run_at = datetime.fromisoformat(data["runAt"].replace("Z", "+00:00"))
        doc["runAt"] = run_at

    if schedule_type == "recurring":
        doc["cron"] = data["cron"]

    result = await schedules.insert_one(doc)

    doc["_id"] = str(result.inserted_id)

    # register immediately in scheduler
    await register_schedule_job(doc)

    return {"message": "Schedule created"}


#----------------------------------LIST FUTURE SCHEDULES--------------------------------#
@app.get("/pipeline/schedules")
async def list_schedules(user=Depends(get_current_user)):

    now = datetime.utcnow()

    items = await schedules.find(
        {
            "userEmail": user,
            "isActive": True,
            "$or": [
                {"type": "recurring"},
                {"runAt": {"$gt": now}}
            ]
        },
        {"_id": 1, "type": 1, "runAt": 1, "cron": 1}
    ).to_list(100)

    # stringify ids
    for item in items:
        item["_id"] = str(item["_id"])

    return items


#----------------------------------DELETE SCHEDULE---------------------------#
@app.delete("/pipeline/schedule/{schedule_id}")
async def delete_schedule(schedule_id: str, user=Depends(get_current_user)):

    schedule = await schedules.find_one({
        "_id": ObjectId(schedule_id),
        "userEmail": user
    })

    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    await schedules.update_one(
        {"_id": ObjectId(schedule_id)},
        {"$set": {"isActive": False}}
    )

    try:
        scheduler.remove_job(schedule_id)
    except:
        pass

    return {"message": "Schedule deleted"}


# ---------------- POLL LATEST JOB ---------------- #

@app.get("/pipeline/status")
async def get_status(user=Depends(get_current_user)):

    latest = await jobs.find_one({}, sort=[("id", -1)])

    if not latest:
        return {"jobType": None, "status": "idle"}

    return {
        "jobType": latest.get("jobType"),
        "status": latest.get("status")
    }


# ---------------- DASHBOARD STATS ---------------- #

@app.get("/dashboard/stats")
async def dashboard_stats(user=Depends(get_current_user)):

    total_leads = await profiles.count_documents({})
    approved_count = await approved.count_documents({})
    invites_sent = await approved.count_documents({"connectionSent": 1})

    return {
        "totalLeads": total_leads,
        "approvedLeads": approved_count,
        "invitesSent": invites_sent
    }


# ---------------- LEADS PAGE ---------------- #

@app.get("/leads/all")
async def get_all(user=Depends(get_current_user)):
    return await profiles.find({}, {"_id": 0}).to_list(10000)


@app.get("/leads/approved")
async def get_approved(user=Depends(get_current_user)):
    return await approved.find({}, {"_id": 0}).to_list(10000)


@app.get("/leads/ready")
async def get_ready(user=Depends(get_current_user)):
    return await approved.find(
        {
            "connectionSent": None,
            "connectionStatus": "waiting_for_review"
        },
        {"_id": 0}
    ).to_list(10000)


# ---------------- SEND INVITE (ATOMIC SAFE) ---------------- #


@app.post("/invite/send")
async def send_invite(data: dict, user=Depends(get_current_user)):

    lead_id = int(data["leadId"])
    message = data["editedMessage"]

    # 🔒 GLOBAL LOCK
    existing = await approved.find_one({"connectionStatus": "sending"})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Another invitation is being sent. Please try after some time."
        )

    # 🔎 VERIFY SENDABLE
    lead = await approved.find_one({
        "id": lead_id,
        "connectionStatus": "waiting_for_review"
    })

    if not lead:
        raise HTTPException(
            status_code=400,
            detail="Lead not in sendable state"
        )

    try:
        # ✅ Generate proper JWT for n8n
        n8n_token = create_n8n_token({"service": "fastapi"})
        print("Generated n8n token:", n8n_token)
        print("MESSAGE SENT TO N8N:", message)
        
        async with httpx.AsyncClient(timeout=300) as client:
            response = await client.post(
                N8N_SEND,
                json={
                    "leadId": lead_id,
                    "personalizedMessage": message
                },
                headers={
                    "Authorization": f"Bearer {n8n_token}"
                }
            )

        print("N8N STATUS:", response.status_code)
        print("N8N RESPONSE:", response.text)

        # 🚨 If n8n returned error, forward it cleanly
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text
            )

        # ✅ Safely return JSON
        try:
            return response.json()
        except Exception:
            return {"message": response.text}

    except HTTPException:
        raise  # Don't re-wrap FastAPI errors

    except Exception as e:
        print("ACTUAL ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- RESET PASSWORD ---------------- #

@app.post("/auth/request-password-reset")
async def request_password_reset(data: dict):
    email = data.get("email")

    user = await users.find_one({"email": email})

    # Always return success (don't reveal if email exists)
    if not user:
        return {"message": "If this email exists, a reset link has been sent."}

    # Generate secure random token
    reset_token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(minutes=30)

    await users.update_one(
        {"email": email},
        {
            "$set": {
                "resetToken": reset_token,
                "resetTokenExpiry": expiry
            }
        }
    )

    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {os.getenv('RESEND_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "from": "onboarding@resend.dev",
                "to": email,  # or user in the second endpoint
                "subject": "Reset Your Password",
                "html": f"""
                    <p>You requested a password reset.</p>
                    <p>Click below to reset your password:</p>
                    <a href="{reset_link}">{reset_link}</a>
                    <p>This link expires in 30 minutes.</p>
                """
            }
        )

    return {"message": "If this email exists, a reset link has been sent."}



@app.post("/auth/confirm-password-reset")
async def confirm_password_reset(data: dict):
    token = data.get("token")
    new_password = data.get("newPassword")

    user = await users.find_one({"resetToken": token})

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Check expiry
    if not user.get("resetTokenExpiry") or user["resetTokenExpiry"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")

    new_hash = hash_password(new_password)

    await users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password": new_hash,
                "resetToken": None,
                "resetTokenExpiry": None
            }
        }
    )

    return {"message": "Password successfully reset"}



@app.post("/user/send-reset-link")
async def send_reset_link(user=Depends(get_current_user)):

    db_user = await users.find_one({"email": user})

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate secure token
    reset_token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(minutes=30)

    await users.update_one(
        {"email": user},
        {
            "$set": {
                "resetToken": reset_token,
                "resetTokenExpiry": expiry
            }
        }
    )

    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {os.getenv('RESEND_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "from": "onboarding@resend.dev",
                "to": user,
                "subject": "Reset Your Password",
                "html": f"""
                    <p>You requested a password reset.</p>
                    <p>Click below to reset your password:</p>
                    <a href="{reset_link}">{reset_link}</a>
                    <p>This link expires in 30 minutes.</p>
                """
            }
        )

    return {"message": "Reset link sent to your email"}


# ---------------- CURRENT USER PROFILE ---------------- #

@app.get("/auth/me")
async def get_me(user=Depends(get_current_user)):

    db_user = await users.find_one(
        {"email": user},
        {
            "_id": 0,
            "password": 0,
            "resetToken": 0,
            "resetTokenExpiry": 0
        }
    )

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user


# ---------------- UPDATE PROFILE ---------------- #

@app.put("/auth/update-profile")
async def update_profile(data: dict, user=Depends(get_current_user)):

    update_data = {}

    if "fullName" in data:
        update_data["fullName"] = data["fullName"]

    if "company" in data:
        update_data["company"] = data["company"]

    await users.update_one(
        {"email": user},
        {"$set": update_data}
    )

    return {"message": "Profile updated"}



@app.get("/test-email")
async def test_email():
    r = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": "debojitchoudhury117@gmail.com",
        "subject": "Backend Email Test",
        "html": "<p>This was sent from FastAPI backend 🚀</p>"
    })

    return {"status": "sent", "resend_response": r}