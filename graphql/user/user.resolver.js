const { print } = require("graphql/language");

module.exports = {

    Query: {

        /**
         *
         * @param parent
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param jwt
         * @param info
         * @return {{userId: string, email: string}}
         */
        user: async (parent, args, { ogm, jwt }, info) => {
            const User = ogm.model("User");

            const [user] = await User.find({
                where: { userId: jwt.sub },
                selectionSet: print(info.fieldNodes[0].selectionSet)
            })

            console.log(jwt)

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
            const userSelection = print(info.fieldNodes[0].selectionSet)
            const selectionSet = `{ users ${userSelection} }`;

            const { users } = await User.create({
                input: [{
                    email: user.email,
                    firstName: user.firstName ?? '',
                    lastName: user.lastName ?? ''
                }],
                selectionSet: selectionSet
            })
            return users[0];
        }
    }
}