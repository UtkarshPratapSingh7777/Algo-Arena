import traceback
from fastapi import FastAPI, HTTPException
from schemas import (
    GenerateProblemRequest, GenerateProblemResponse,
    GenerateTestCasesRequest, GenerateTestCasesResponse,
)
from chains.problem_chain import generate_problems
from chains.testcase_chain import generate_test_cases

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate/problems", response_model=GenerateProblemResponse)
async def generate_problems_route(req: GenerateProblemRequest):
    try:
        problems = await generate_problems(req.difficulty, req.tags, req.count)
        return {"problems": problems}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/testcases", response_model=GenerateTestCasesResponse)
async def generate_testcases_route(req: GenerateTestCasesRequest):
    try:
        test_cases = await generate_test_cases(req.dict(), req.count)
        return {"test_cases": test_cases}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))