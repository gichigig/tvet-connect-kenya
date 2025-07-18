# AI Detector API

This is a FastAPI-based backend for detecting AI-generated essays using a HuggingFace transformer model.

## Usage

1. **Build and run with Docker:**
   ```sh
   docker build -t ai-essay-detector .
   docker run -p 8000:8000 ai-essay-detector
   ```

2. **Or run locally:**
   ```sh
   python -m pip install -r requirements.txt
   python -m uvicorn main:app --reload
   ```

3. **API Endpoint:**
   - POST `/detect` with JSON `{ "text": "your essay here" }`
   - Returns `{ "ai_probability": 0-100 }`

## Model
- Uses `roberta-base-openai-detector` from HuggingFace.

---

**Edit `main.py` to customize detection logic or add more endpoints as needed.**
