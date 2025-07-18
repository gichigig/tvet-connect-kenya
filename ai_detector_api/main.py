from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

app = FastAPI()

tokenizer = AutoTokenizer.from_pretrained("roberta-base-openai-detector")
model = AutoModelForSequenceClassification.from_pretrained("roberta-base-openai-detector")

class EssayRequest(BaseModel):
    text: str

@app.post("/detect")
async def detect_ai_essay(req: EssayRequest):
    inputs = tokenizer(req.text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        logits = model(**inputs).logits
        prob = torch.sigmoid(logits)[0][0].item()
    return {"ai_probability": round(prob * 100, 2)}
