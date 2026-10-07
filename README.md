# IMAGE-TRACE

Evidence-Aware Digital Image Forensic Investigation System.

## Running the Application

### Backend
1. Create a virtual environment: `python -m venv venv`
2. Activate: `venv\Scripts\activate`
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Run FastAPI server: `uvicorn backend.main:app --reload`
5. Test: `pytest`

### Frontend
1. Open `frontend/index.html` in a web browser. No local server required for the basic shell.

## Stage 0 Status
- **IMPLEMENTED**: Foundation structure, Pydantic Models, FastAPI base.
- **TESTED**: Core Evidence and Decision logic typing.
- **VALIDATED**: Yes.
- **NOT VALIDATED**: N/A
- **BLOCKED**: N/A
- **SYNTHETIC/DEMO-ONLY**: None.
- **KNOWN LIMITATIONS**: No actual analysis yet.
