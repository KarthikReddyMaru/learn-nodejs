
module.exports = {
    Query: {
        student: (parent, args, context, info) => {
            return {
                "id": args.id,
                "name": "Student",
                "age": 22
            }
        }
    }
}