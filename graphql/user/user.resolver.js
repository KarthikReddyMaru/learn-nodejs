const { print } = require("graphql/language");

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
                where: { userId: id },
                selectionSet: print(info.fieldNodes[0].selectionSet)
            })

            return user;
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
                }],
                selectionSet: print(info.fieldNodes[0].selectionSet)
            })

            return users[0];
        }
    }
}