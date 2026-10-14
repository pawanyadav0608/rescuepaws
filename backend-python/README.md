# RescuePaws Python FastAPI Backend

This is an alternative backend implementation for RescuePaws built with Python 3 and FastAPI.

## How to Run Locally

1. Create and activate a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server on port 8000:
```bash
uvicorn main:app --reload --port 8000
```

4. Interactive Swagger API Docs:
Open `http://localhost:8000/docs` in your browser.
