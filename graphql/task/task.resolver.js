module.exports = {
    Query: {
        task: (parent, args, context, info) => {
            return {
                "id": args.id,
                "name": "Task",
                "age": 22
            }
        }
    },

    Mutation: {

        /**
         *
         * @param parent
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         * @return {{taskId: string, title: string, description: string}}
         */

        createTask: async (parent, args, { ogm }, info) => {
            const Task = ogm.model("Task")
            const { tasks } = await Task.create({
                input: [{
                    title: args.task.title,
                    description: args.task.description
                }]
            })
            return {
                "taskId": tasks[0].taskId,
                "title": tasks[0].title,
                "description": tasks[0].description
            }
        }
    }
}