import boto3
import os
from botocore.exceptions import ClientError
from datetime import datetime

class S3Uploader:
    def __init__(self):
        # Read environment variables (strip any whitespace!)
        access_key = os.getenv('AWS_ACCESS_KEY_ID', '').strip()
        secret_key = os.getenv('AWS_SECRET_ACCESS_KEY', '').strip()
        region = os.getenv('AWS_REGION', 'us-east-1').strip()
        bucket_name = os.getenv('AWS_S3_BUCKET_NAME', '').strip()
        
        # Validate
        if not access_key or not secret_key or not bucket_name:
            raise ValueError("AWS credentials or bucket name not configured")
        
        print(f"Initializing S3 client for bucket: '{bucket_name}' in region: '{region}'")
        
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )
        self.bucket_name = bucket_name
    
    def upload_file(self, file_path: str, object_name: str = None) -> str:
        """
        Upload file to S3 bucket
        
        Args:
            file_path: Local path to file
            object_name: S3 object name (if None, uses filename)
        
        Returns:
            Public URL of uploaded file
        """
        
        if object_name is None:
            object_name = os.path.basename(file_path)
        
        # Add timestamp to avoid collisions
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_ext = os.path.splitext(object_name)[1]
        base_name = os.path.splitext(object_name)[0]
        object_name = f"{base_name}_{timestamp}{file_ext}"
        
        try:
            # Determine content type
            content_type = 'video/mp4' if file_path.endswith('.mp4') else 'image/png'
            
            print(f"Uploading {file_path} to s3://{self.bucket_name}/{object_name}")
            
            # Upload file
            self.s3_client.upload_file(
                file_path,
                self.bucket_name,
                object_name,
                ExtraArgs={
                    'ContentType': content_type,
                    'ACL': 'public-read'
                }
            )
            
            # Construct public URL
            # Format: https://bucket-name.s3.region.amazonaws.com/object-key
            url = f"https://{self.bucket_name}.s3.amazonaws.com/{object_name}"
            
            print(f"✅ Uploaded successfully: {url}")
            return url
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_msg = e.response['Error']['Message']
            print(f"❌ S3 upload error [{error_code}]: {error_msg}")
            raise Exception(f"Failed to upload to S3: {error_msg}")
    
    def upload_video_and_thumbnail(self, video_path: str, thumbnail_path: str = None) -> dict:
        """
        Upload video and optional thumbnail
        
        Returns:
            dict with video_url and thumbnail_url
        """
        
        result = {}
        
        # Upload video
        video_filename = os.path.basename(video_path)
        result['video_url'] = self.upload_file(video_path, f"videos/{video_filename}")
        
        # Upload thumbnail if exists
        if thumbnail_path and os.path.exists(thumbnail_path):
            thumb_filename = os.path.basename(thumbnail_path)
            result['thumbnail_url'] = self.upload_file(thumbnail_path, f"thumbnails/{thumb_filename}")
        else:
            result['thumbnail_url'] = None
        
        return result
    
    def test_connection(self):
        """Test if S3 connection works"""
        try:
            # Try to list objects (will fail if credentials are wrong)
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            print(f"✅ Successfully connected to S3 bucket: {self.bucket_name}")
            return True
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                print(f"❌ Bucket '{self.bucket_name}' does not exist")
            elif error_code == '403':
                print(f"❌ Access denied to bucket '{self.bucket_name}'")
            else:
                print(f"❌ S3 connection error: {e}")
            return False