set -e
cd ${S:?pasta de trabalho}
while pgrep -f stage1_rife.py >/dev/null; do sleep 5; done
python3 code/stage2_face.py ${S:?pasta de trabalho} plan
python3 code/stage2_face.py ${S:?pasta de trabalho} 0 2 > s2w0.log 2>&1 &
python3 code/stage2_face.py ${S:?pasta de trabalho} 1 2 > s2w1.log 2>&1 &
wait
ls face | wc -l
ffmpeg -v error -y -framerate 30 -i face/c%03d.png -vf "scale=1080:1920:flags=lanczos,noise=alls=3:allf=t,format=yuv420p" -c:v libx264 -profile:v high -level 4.1 -preset slow -crf 16 -r 30 -frames:v 450 -an -movflags +faststart Avatar_Professora_UGC_FINAL_FLUIDO.mp4
echo DONE
