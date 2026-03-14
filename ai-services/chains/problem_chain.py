import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.8,
)

prompt = PromptTemplate(
    template="""
You are an expert competitive programming problem setter.
Generate {count} unique coding problem(s) with:
- Difficulty: {difficulty}
- Topics: {tags}

Return ONLY a raw JSON array with no markdown and no explanation.
Each object must have exactly these fields:
title, description, difficulty, constraints, input_format, output_format,
sample_input, sample_output, tags, starter_code

[
  {{
    "title": "...",
    "description": "...",
    "difficulty": "{difficulty}",
    "constraints": "...",
    "input_format": "...",
    "output_format": "...",
    "sample_input": "...",
    "sample_output": "...",
    "tags": [...],
    "starter_code": "function solution(input) {{\\n  \\n}}"
  }}
]
""",
    input_variables=["difficulty", "tags", "count"],
)

problem_chain = prompt | llm


async def generate_problems(difficulty: str, tags: list, count: int) -> list:
    response = await problem_chain.ainvoke({
        "difficulty": difficulty,
        "tags": ", ".join(tags),
        "count": count,
    })

    raw = response.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    return json.loads(raw.strip())