import Problem from "../models/Problems.model.js";

export const getProblem = async(req,res) => {
    try {
        const {problemId} = req.params;
        let problem = await Problem.findById(problemId);
        if(!problem){
            return res.status(404).json({
                message : "Problem does not exists",
                success : false
            })
        }
        problem = {
            problemId,
            title : problem.title,
            description : problem.description,
            difficulty : problem.difficulty,
            topics : problem.topics,
            visibleTestcases : problem.visibleTestcases
        }
        return res.status(200).json({
            message : "Problem Fetched",
            success : true,
            problem
        })
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({
            message : "Some Error Occurred",
            status : false
        })
    }
}