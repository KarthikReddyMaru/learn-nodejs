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
                where: {
                    taskId: args.id
                },
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

            const userSelectionSet = print(info.fieldNodes[0].selectionSet)
            const selectionSet = `{
                tasks ${userSelectionSet}
            }`

            const input = {
                ...args.task,
                project: {
                    connect: {
                        where: {
                            node: { projectId: args.projectId }
                        }
                    }
                }
            }

            const { tasks } = await Task.create({
                input: [input],
                selectionSet: selectionSet
            })

            return tasks[0];
        },


        /**
         *
         * @param parent
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         * @return {{taskId: string, title: string, description: string}}
         */
        updateTask: async (parent, { taskId, task }, { ogm }, info) => {
            const Task = ogm.model("Task");
            const userSelectionSet = print(info.fieldNodes[0].selectionSet)
            const selectionSet = `{
                tasks ${userSelectionSet}
            }`

            const { tasks } = await Task.update({
                where: { taskId: taskId },
                update: task,
                selectionSet: selectionSet
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
                        where: { node: { userId: userId } }
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
        },

        /**
         *
         * @param parent
         * @param parentTaskId
         * @param childTaskId
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         * @return {Promise<boolean>}
         */
        subIssue: async (parent, { parentTaskId, childTaskId }, { ogm }, info) => {
            const Task = ogm.model("Task");

            await Task.update({
                where: { taskId: childTaskId },
                connect: {
                    superIssues: {
                        where: { node : { taskId: parentTaskId } }
                    }
                }
            })
            return true;
        }
    }
}