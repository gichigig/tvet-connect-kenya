import requests

API_URL = "http://localhost:8000/detect"

def test_essay(text):
    response = requests.post(API_URL, json={"text": text})
    print("Essay:", text)
    print("AI Probability:", response.json()["ai_probability"], "%")

if __name__ == "__main__":
    # Example essay
    essay = "This is an example essay. It is written to test the AI detector."
    test_essay(essay)
