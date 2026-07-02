import sys
import json
import os
import argparse
import subprocess
import shutil
import yt_dlp
import soundfile as sf
if hasattr(os, 'add_dll_directory'):
    dll_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'venv', 'Scripts')
    if os.path.exists(dll_dir):
        os.add_dll_directory(dll_dir)
from pedalboard import Pedalboard, PitchShift

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--pitch", type=float, required=True)
    parser.add_argument("--jobId", required=True)
    args = parser.parse_args()

    job_dir = os.path.join(os.getcwd(), "jobs", args.jobId)
    os.makedirs(job_dir, exist_ok=True)
    
    try:
        raw_audio_path = os.path.join(job_dir, "raw.wav")
        ffmpeg_path = r"C:\Users\DAVID\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin"

        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(job_dir, 'raw.%(ext)s'),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
            }],
            'ffmpeg_location': ffmpeg_path,
            'quiet': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([args.url])
            
        # No pitch shifting in this step, Demucs runs on raw audio
        subprocess.run([
            sys.executable, "-m", "demucs.separate",
            "-n", "htdemucs_6s",
            "-o", job_dir,
            raw_audio_path
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Demucs output folder
        demucs_out = os.path.join(job_dir, "htdemucs_6s", "raw")
        
        # Move back to job_dir with 'original_' prefix
        stems = ["vocals", "drums", "bass", "other", "piano", "guitar"]
        for stem in stems:
            shutil.move(os.path.join(demucs_out, f"{stem}.wav"), os.path.join(job_dir, f"original_{stem}.wav"))
        
        # Cleanup
        os.remove(raw_audio_path)
        shutil.rmtree(os.path.join(job_dir, "htdemucs_6s"))
        
        print(json.dumps({
            "status": "success",
            "jobId": args.jobId,
            "vocals": f"/api/download/{args.jobId}/original_vocals.wav",
            "drums": f"/api/download/{args.jobId}/original_drums.wav",
            "bass": f"/api/download/{args.jobId}/original_bass.wav",
            "other": f"/api/download/{args.jobId}/original_other.wav",
            "piano": f"/api/download/{args.jobId}/original_piano.wav",
            "guitar": f"/api/download/{args.jobId}/original_guitar.wav"
        }))
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
