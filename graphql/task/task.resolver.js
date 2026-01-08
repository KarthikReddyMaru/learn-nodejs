const { print } = require("graphql/language");

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
                where: {taskId: args.id},
                selectionSet: print(info.fieldNodes[0].selectionSet)
            })

            return task[0];
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
                }],
                selectionSet: print(info.fieldNodes[0].selectionSet)
            })
            return tasks[0];
        },

        /**
         *
         * @param parent
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
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
        },

        /**
         *
         * @param parent
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         */
        unassignTask: async (parent, { userId, taskId }, { ogm }, info) => {
            const Task = ogm.model("Task");
            await Task.update({
                where: {taskId: taskId},
                disconnect: {
                    assignees: [{
                        where: { node: { userId: userId } }
                    }]
                }
            })

            return true;
        }
    }
}