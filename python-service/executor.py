# executor.py
import os
import subprocess
import tempfile
import shutil
from pathlib import Path
from PIL import Image

def execute_manim_code(code: str, scene_name: str, quality: str = "l") -> dict:
    """
    Execute Manim code and return video path
    
    Args:
        code: Python code with Manim Scene
        scene_name: Name of the Scene class
        quality: 'l' (low/480p), 'm' (medium/720p), 'h' (high/1080p)
    
    Returns:
        dict with success, video_path, thumbnail_path, error
    """
    
    # Create temporary directory
    temp_dir = tempfile.mkdtemp(prefix="manim_")
    code_file = os.path.join(temp_dir, "scene.py")
    
    try:
        # Write code to file
        with open(code_file, 'w', encoding='utf-8') as f:
            f.write(code)
        
        # Quality settings
        quality_map = {
            'l': 'l',  # 480p, 15fps - fast
            'm': 'm',  # 720p, 30fps - medium  
            'h': 'h',  # 1080p, 60fps - slow
        }
        q = quality_map.get(quality, 'l')
        
        # Run Manim command
        command = [
            'manim',
            '-q' + q,           # quality flag
            '--format=mp4',     # output format
            '--media_dir', temp_dir,  # output directory
            code_file,
            scene_name
        ]
        
        print(f"Running command: {' '.join(command)}")
        
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=60,  # 60 second timeout
            cwd=temp_dir
        )
        
        if result.returncode != 0:
            error_msg = result.stderr or result.stdout
            print(f"Manim error: {error_msg}")
            return {
                'success': False,
                'error': f"Manim rendering failed: {error_msg[:500]}"
            }
        
        # Find generated video
        # Manim outputs to: temp_dir/videos/scene/quality/SceneName.mp4
        video_dir = os.path.join(temp_dir, 'videos', 'scene')
        
        # Search for video file
        video_path = None
        for root, dirs, files in os.walk(video_dir):
            for file in files:
                if file.endswith('.mp4'):
                    video_path = os.path.join(root, file)
                    break
            if video_path:
                break
        
        if not video_path or not os.path.exists(video_path):
            return {
                'success': False,
                'error': 'Video file not found after rendering'
            }
        
        # Generate thumbnail (first frame)
        thumbnail_path = generate_thumbnail(video_path, temp_dir)
        
        return {
            'success': True,
            'video_path': video_path,
            'thumbnail_path': thumbnail_path,
            'temp_dir': temp_dir,
            'duration': get_video_duration(video_path),
        }
        
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Rendering timeout (max 60 seconds)'
        }
    except Exception as e:
        print(f"Execution error: {str(e)}")
        return {
            'success': False,
            'error': f'Execution failed: {str(e)}'
        }

def generate_thumbnail(video_path: str, output_dir: str) -> str:
    """
    Generate thumbnail from first frame of video
    Returns: path to thumbnail
    """
    try:
        thumbnail_path = os.path.join(output_dir, 'thumbnail.png')
        
        # Use ffmpeg to extract first frame
        command = [
            'ffmpeg',
            '-i', video_path,
            '-ss', '00:00:00',  # First frame
            '-vframes', '1',
            '-y',  # Overwrite
            thumbnail_path
        ]
        
        subprocess.run(command, capture_output=True, timeout=10)
        
        if os.path.exists(thumbnail_path):
            return thumbnail_path
        return None
        
    except Exception as e:
        print(f"Thumbnail generation error: {e}")
        return None

def get_video_duration(video_path: str) -> float:
    """Get video duration in seconds"""
    try:
        command = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            video_path
        ]
        result = subprocess.run(command, capture_output=True, text=True)
        return float(result.stdout.strip())
    except:
        return 0.0

def cleanup_temp_dir(temp_dir: str):
    """Clean up temporary directory"""
    try:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
    except Exception as e:
        print(f"Cleanup error: {e}")