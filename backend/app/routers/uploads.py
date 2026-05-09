"""File upload router using Supabase Storage."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional
from ..services import get_supabase

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    project_id: Optional[str] = Form(None),
    category: str = Form(default="general"),
):
    """Upload a photo to Supabase Storage and create a photo record."""
    supabase = get_supabase()

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/heic"]
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    # Read file content
    contents = await file.read()
    max_size = 50 * 1024 * 1024  # 50MB
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="File exceeds 50MB limit")

    # Upload to Supabase Storage
    import time
    storage_path = f"site-photos/{int(time.time() * 1000)}_{file.filename}"

    bucket_name = "buildtrack-photos" if _bucket_exists(supabase, "buildtrack-photos") else "photos"

    try:
        upload_result = supabase.storage.from_(bucket_name).upload(
            path=storage_path,
            file=contents,
            file_options={"content-type": file.content_type or "image/jpeg"},
        )
    except Exception as e:
        # Try creating bucket if it doesn't exist
        try:
            supabase.storage.create_bucket(bucket_name, {"public": True})
            upload_result = supabase.storage.from_(bucket_name).upload(
                path=storage_path,
                file=contents,
                file_options={"content-type": file.content_type or "image/jpeg"},
            )
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e2)}")

    # Get public URL
    public_url = supabase.storage.from_(bucket_name).get_public_url(storage_path)

    # Create photo record
    photo_data = {
        "url": public_url,
        "project_id": project_id,
        "category": category,
    }

    try:
        db_result = supabase.table("photos").insert(photo_data).execute()
        photo_id = db_result.data[0]["id"] if db_result.data else None
    except Exception:
        photo_id = None  # Photo uploaded but DB record failed — non-critical

    return {
        "id": photo_id,
        "url": public_url,
        "path": storage_path,
        "filename": file.filename,
    }


@router.get("/photos")
async def list_photos(
    project_id: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50,
):
    """List uploaded photos with optional filters."""
    supabase = get_supabase()
    query = supabase.table("photos").select("*").order("created_at", desc=True)

    if project_id:
        query = query.eq("project_id", project_id)
    if category:
        query = query.eq("category", category)

    result = query.limit(limit).execute()
    return result.data or []


def _bucket_exists(supabase, bucket_name: str) -> bool:
    try:
        buckets = supabase.storage.list_buckets()
        return any(b.name == bucket_name for b in buckets)
    except Exception:
        return False
