from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from validator import validate_code, extract_scene_name
from executor import execute_manim_code, cleanup_temp_dir
from s3_uploader import S3Uploader 

load_dotenv()

app = FastAPI(title="Manim Renderer Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize S3 uploader
s3_uploader = S3Uploader()  # Add this

class RenderRequest(BaseModel):
    code: str
    quality: str = "l"

class RenderResponse(BaseModel):
    success: bool
    message: str
    video_url: str = None
    thumbnail_url: str = None
    duration: float = None
    error: str = None

@app.get("/")
def root():
    return {"service": "Manim Renderer", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/execute", response_model=RenderResponse)
async def execute_code(request: RenderRequest):
    """Execute Manim code and upload to S3"""
    
    # Validate
    is_valid, error_msg = validate_code(request.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    scene_name = extract_scene_name(request.code)
    if not scene_name:
        raise HTTPException(status_code=400, detail="Scene class not found")
    
    print(f"Executing scene: {scene_name}")
    
    # Execute
    result = execute_manim_code(
        code=request.code,
        scene_name=scene_name,
        quality=request.quality
    )
    
    if not result['success']:
        raise HTTPException(status_code=500, detail=result['error'])
    
    video_path = result['video_path']
    thumbnail_path = result.get('thumbnail_path')
    temp_dir = result['temp_dir']
    
    try:
        # Upload to S3
        print("Uploading to S3...")
        upload_result = s3_uploader.upload_video_and_thumbnail(
            video_path=video_path,
            thumbnail_path=thumbnail_path
        )
        
        print(f"Upload complete! Video: {upload_result['video_url']}")
        
        return RenderResponse(
            success=True,
            message="Video rendered and uploaded successfully",
            video_url=upload_result['video_url'],
            thumbnail_url=upload_result.get('thumbnail_url'),
            duration=result.get('duration', 0)
        )
        
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
        
    finally:
        # Cleanup
        cleanup_temp_dir(temp_dir)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)