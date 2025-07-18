python3 -m pip install -r requirements.txt
cd ai_detector_api
docker build -t ai-essay-detector .
docker run -p 8000:8000 ai-essay-detector