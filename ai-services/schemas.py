from pydantic import BaseModel
from typing import List, Optional

class GenerateProblemRequest(BaseModel):
    difficulty: str = "medium"
    tags: List[str] = ["arrays", "dp"]
    count: int = 1

class GenerateTestCasesRequest(BaseModel):
    title: str
    description: str
    input_format: str
    output_format: str
    constraints: str
    count: int = 10

class Problem(BaseModel):
    title: str
    description: str
    difficulty: str
    constraints: str
    input_format: str
    output_format: str
    sample_input: str
    sample_output: str
    tags: List[str]
    starter_code: str

class TestCase(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = ""

class GenerateProblemResponse(BaseModel):
    problems: List[Problem]

class GenerateTestCasesResponse(BaseModel):
    test_cases: List[TestCase]