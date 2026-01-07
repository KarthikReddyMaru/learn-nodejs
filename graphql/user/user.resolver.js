module.exports = {
    Query: {

        /**
         *
         * @param parent
         * @param id
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         * @return {{userId: string, email: string}}
         */
        user: async (parent, { id }, { ogm }, info) => {
            const User = ogm.model("User");

            const [user] = await User.find({
                where: {userId: id}
            })

            return {
                "userId": user.userId,
                "email": user.email,
                "firstName": user.firstName,
                "lastName": user.lastName,
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
         */
        createUser: async (parent, { user }, { ogm }, info) => {

            const User = ogm.model("User");

            const { users } = await User.create({
                input: [{
                    email: user.email,
                    firstName: user.firstName ?? '',
                    lastName: user.lastName ?? ''
                }]
            })

            return {
                "userId": users[0].userId,
                "email": users[0].email,
                "firstName": users[0].firstName,
                "lastName": users[0].lastName
            }
        }
    },

    User: {

        /**
         *
         * @param userId
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         * @return {Promise<*[]>}
         */
        assignedTasks: async ({ userId }, args, { ogm }, info) => {
            const User = ogm.model("User");

            const [user] = await User.find({
                where: { userId: userId },
                selectionSet: `{
                    assignedTasks
                    {
                        taskId
                        title
                        description
                    }
                }`
            })

            const assignedTasks = [];
            user.assignedTasks.forEach((task, index) => {
                assignedTasks.push(task);
            })
            return assignedTasks;
        }
    }
}