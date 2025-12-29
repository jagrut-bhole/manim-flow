# main.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from validator import validate_code, extract_scene_name
from executor import execute_manim_code, cleanup_temp_dir

app = FastAPI(title="Manim Renderer Service")

# CORS - allow Next.js to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RenderRequest(BaseModel):
    code: str
    quality: str = "l"  # l, m, h

class RenderResponse(BaseModel):
    success: bool
    message: str
    video_url: str = None
    thumbnail_url: str = None
    duration: float = None
    error: str = None

@app.get("/")
def root():
    return {
        "service": "Manim Renderer",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/execute", response_model=RenderResponse)
async def execute_code(request: RenderRequest):
    """
    Execute Manim code and return video
    """
    
    # Validate code
    is_valid, error_msg = validate_code(request.code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Extract scene name
    scene_name = extract_scene_name(request.code)
    if not scene_name:
        raise HTTPException(
            status_code=400,
            detail="Could not find Scene class name in code"
        )
    
    print(f"Executing scene: {scene_name}")
    
    # Execute code
    result = execute_manim_code(
        code=request.code,
        scene_name=scene_name,
        quality=request.quality
    )
    
    if not result['success']:
        raise HTTPException(status_code=500, detail=result['error'])
    
    # Read video file
    video_path = result['video_path']
    temp_dir = result['temp_dir']
    
    try:
        # Read video as bytes
        with open(video_path, 'rb') as f:
            video_bytes = f.read()
        
        # Read thumbnail if exists
        thumbnail_bytes = None
        if result.get('thumbnail_path'):
            with open(result['thumbnail_path'], 'rb') as f:
                thumbnail_bytes = f.read()
        
        # For now, we'll return the video directly
        # Later, you'll upload to S3 and return URL
        
        # Save to static folder temporarily (for testing)
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        
        output_video = os.path.join(output_dir, f"{scene_name}.mp4")
        with open(output_video, 'wb') as f:
            f.write(video_bytes)
        
        output_thumb = None
        if thumbnail_bytes:
            output_thumb = os.path.join(output_dir, f"{scene_name}_thumb.png")
            with open(output_thumb, 'wb') as f:
                f.write(thumbnail_bytes)
        
        return RenderResponse(
            success=True,
            message="Video rendered successfully",
            video_url=f"/video/{scene_name}.mp4",
            thumbnail_url=f"/video/{scene_name}_thumb.png" if output_thumb else None,
            duration=result.get('duration', 0)
        )
        
    finally:
        # Cleanup temp directory
        cleanup_temp_dir(temp_dir)

@app.get("/video/{filename}")
async def get_video(filename: str):
    """Serve rendered video"""
    file_path = os.path.join("output", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)