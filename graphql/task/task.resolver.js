module.exports = {
    Query: {

        /**
         *
         * @param parent
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         * @return {{id: *, name: string, age: number}}
         */

        task: async (parent, args, { ogm }, info) => {

            const Task = ogm.model("Task");
            const task = await Task.find({
                where: {taskId: args.id}
            })

            return {
                "taskId": task[0].taskId,
                "title": task[0].title,
                "description": task[0].description
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
        },

        /**
         *
         * @param parent
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         * @return {{taskId: string, title: string, description: string}}
         */
        assignTask: async (parent, { userId, taskId }, { ogm }, info) => {
            const Task = ogm.model("Task")
            await Task.update({
                where: { taskId: taskId },
                connect: {
                    assignees: [{
                        where: { node: { userId: userId } },
                        edge: { info: "Did that work?" }
                    }]
                }
            })

            return true;
        }
    },

    Task: {

        /**
         *
         * @param taskId
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         */
        assignees: async ({ taskId }, args, { ogm }, info) => {
            const Task = ogm.model("Task");

            const [task] = await Task.find({
                where: {taskId: taskId},
                selectionSet: `{
                    assignees {
                        userId
                        email
                        firstName
                    }
                }`
            })

            const assignees = []

            task.assignees.forEach((assignee, index) => {
                assignees.push(assignee);
            })

            return assignees;
        }
    }
}