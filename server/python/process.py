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
        # 1. Download
        raw_audio_path = os.path.join(job_dir, "raw.wav")
        ffmpeg_path = r"C:\Users\William\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"
        if not os.path.exists(ffmpeg_path):
            ffmpeg_path = "ffmpeg"

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
            
        pitch_shifted_path = os.path.join(job_dir, "pitch_shifted.wav")
        audio_data, sample_rate = sf.read(raw_audio_path)
        
        if args.pitch != 0:
            board = Pedalboard([PitchShift(semitones=args.pitch)])
            effected = board(audio_data, sample_rate)
            sf.write(pitch_shifted_path, effected, sample_rate)
        else:
            sf.write(pitch_shifted_path, audio_data, sample_rate)

        # 3. Stem Separation (Demucs)
        # --two-stems=vocals cria "vocals" e "no_vocals"
        subprocess.run([
            sys.executable, "-m", "demucs.separate",
            "--two-stems=vocals",
            "-n", "htdemucs",
            "-o", job_dir,
            pitch_shifted_path
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Demucs output folder
        demucs_out = os.path.join(job_dir, "htdemucs", "pitch_shifted")
        
        # Move back to job_dir
        shutil.move(os.path.join(demucs_out, "vocals.wav"), os.path.join(job_dir, "vocals.wav"))
        shutil.move(os.path.join(demucs_out, "no_vocals.wav"), os.path.join(job_dir, "accompaniment.wav"))
        
        # Cleanup
        os.remove(raw_audio_path)
        os.remove(pitch_shifted_path)
        shutil.rmtree(os.path.join(job_dir, "htdemucs"))
        
        print(json.dumps({
            "status": "success",
            "jobId": args.jobId,
            "vocals": f"{args.jobId}/vocals.wav",
            "accompaniment": f"{args.jobId}/accompaniment.wav"
        }))
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
