import Contest from "../models/Contest.model.js"

setInterval(async () => {
    const contests = await Contest.find({
        status: "running",
        endTime: { $lte: new Date() }
    })
    for (const contest of contests) {
        contest.status = "finished"
        await contest.save()
        console.log("Contest ended:", contest._id)
    }
}, 5000)