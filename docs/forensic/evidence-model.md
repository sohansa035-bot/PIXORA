# Evidence Model

## LEVEL 1 — 10-YEAR-OLD EXPLANATION
When we look at a picture, we gather clues. A clue could be "the lighting is wrong" or "the camera info is missing". We take all these clues and put them in a standard box so we can compare them easily. 

## LEVEL 2 — EXPERIENCED COMPUTER SCIENCE ENGINEER EXPLANATION
The `Evidence` model uses Pydantic to strictly type the forensic outputs. It normalizes outputs from heterogeneous analyzers into a single struct.
Key fields include:
- `observation` vs `inference`: We strictly separate raw output (e.g., "high ELA noise") from human-readable meaning ("possible splicing").
- `status`: Identifies if the evidence is verified or weak.
- `limitations`: Explicitly notes the boundary of the method used to collect the evidence.
