import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
import time
load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3,
)

prompt = PromptTemplate(
    template="""
You are an expert at writing test cases for competitive programming problems.

Problem: {title}
Description: {description}
Input Format: {input_format}
Output Format: {output_format}
Constraints: {constraints}

Generate exactly {count} test cases:
- {basic} basic cases
- {edge} edge cases
- {stress} large stress cases

Every test case must have the correct expected output.

Return ONLY a raw JSON array with no markdown and no explanation:
[
  {{
    "input": "...",
    "output": "...",
    "explanation": "..."
  }}
]
""",
    input_variables=["title", "description", "input_format", "output_format", "constraints", "count", "basic", "edge", "stress"],
)

testcase_chain = prompt | llm


async def generate_test_cases(problem: dict, count: int = 10) -> list:
    basic = count // 3
    edge = count // 3
    stress = count - basic - edge

    response = await testcase_chain.invoke({
        "title": problem["title"],
        "description": problem["description"],
        "input_format": problem.get("input_format", ""),
        "output_format": problem.get("output_format", ""),
        "constraints": problem.get("constraints", ""),
        "count": count,
        "basic": basic,
        "edge": edge,
        "stress": stress,
    })
    print("done");
    time.sleep(14000);
    raw = response.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    return json.loads(raw.strip())