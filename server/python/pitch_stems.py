import sys
import json
import os
import argparse
import soundfile as sf
import traceback
import concurrent.futures

if hasattr(os, 'add_dll_directory'):
    dll_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'venv', 'Scripts')
    if os.path.exists(dll_dir):
        os.add_dll_directory(dll_dir)
from pedalboard import Pedalboard, PitchShift

def process_stem(stem, args, pitch_str, job_dir):
    original_path = os.path.join(job_dir, f"original_{stem}.wav")
    pitched_path = os.path.join(job_dir, f"pitch_{pitch_str}_{stem}.wav")
    
    if os.path.exists(pitched_path):
        return
        
    if not os.path.exists(original_path):
        raise FileNotFoundError(f"Missing {original_path}")

    audio_data, sample_rate = sf.read(original_path, dtype='float32')
    board = Pedalboard([PitchShift(semitones=args.pitch)])
    
    if len(audio_data.shape) == 2:
        effected = board(audio_data.T, sample_rate)
        sf.write(pitched_path, effected.T, sample_rate, subtype='PCM_16')
    else:
        effected = board(audio_data, sample_rate)
        sf.write(pitched_path, effected, sample_rate, subtype='PCM_16')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--jobId", required=True)
    parser.add_argument("--pitch", type=float, required=True)
    args = parser.parse_args()

    job_dir = os.path.join(os.getcwd(), "jobs", args.jobId)
    stems = ["vocals", "drums", "bass", "other", "piano", "guitar"]
    
    pitch_str = str(int(args.pitch)) if args.pitch.is_integer() else str(args.pitch)
    
    try:
        # Process in parallel using threads (since pedalboard releases GIL mostly)
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            futures = [executor.submit(process_stem, stem, args, pitch_str, job_dir) for stem in stems]
            for future in concurrent.futures.as_completed(futures):
                future.result() # raises exception if any thread failed
                
        print(json.dumps({
            "status": "success",
            "jobId": args.jobId,
            "vocals": f"/api/download/{args.jobId}/pitch_{pitch_str}_vocals.wav",
            "drums": f"/api/download/{args.jobId}/pitch_{pitch_str}_drums.wav",
            "bass": f"/api/download/{args.jobId}/pitch_{pitch_str}_bass.wav",
            "other": f"/api/download/{args.jobId}/pitch_{pitch_str}_other.wav",
            "piano": f"/api/download/{args.jobId}/pitch_{pitch_str}_piano.wav",
            "guitar": f"/api/download/{args.jobId}/pitch_{pitch_str}_guitar.wav"
        }))
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e),
            "trace": traceback.format_exc()
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
