const { print } = require("graphql/language");

module.exports = {
    Query: {

        /**
         *
         * @param parent
         * @param id
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         */
        org: async (parent, { orgId }, { ogm }, info) => {
            const Org = ogm.model("Org")

            const [ org ] = Org.find({
                where: { orgId: orgId },
                selectionSet: print(info.fieldNodes[0].selectionSet)
            })

            return org;
        }
    },

    Mutation: {

        /**
         *
         * @param parent
         * @param name
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param jwt
         * @param info
         */
        createOrg: async (parent, { name }, { ogm, jwt }, info) => {
            const Org = ogm.model("Org");

            const clientSelection = print(info.fieldNodes[0].selectionSet);
            const selectionSet = `{
                orgs ${clientSelection}
            }`;

            const { orgs } = await Org.create({
                input: [{
                    name: name,
                    employees: {
                        connect: {
                            where: {
                                node: {
                                    userId: jwt.sub
                                }
                            }
                        }
                    }
                }],
                selectionSet: selectionSet
            })

            return orgs[0];
        },


        /**
         *
         * @param parent
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param jwt
         * @param info
         */
        joinOrg: async (parent, { orgId }, { ogm, jwt }, info) => {

            const Org = ogm.model("Org");
            const clientSelection = print(info.fieldNodes[0].selectionSet)
            const selectionSet = `{ orgs ${clientSelection} }`

            const { orgs } = await Org.update({
                where: { orgId: orgId },
                connect: {
                    employees: [{
                        where: {
                            node: { userId: jwt.sub }
                        }
                    }]
                },
                selectionSet: selectionSet
            })

            return orgs[0];
        },

        /**
         *
         * @param parent
         * @param args
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         */
        leaveOrg: async (parent, { orgId, userId }, { ogm }, info) => {

            const Org = ogm.model("Org");
            const clientSelection = print(info.fieldNodes[0].selectionSet)
            const selectionSet = `{ orgs ${clientSelection} }`

            const { orgs } = await Org.update({
                where: { orgId: orgId },
                disconnect: {
                    employees: [{
                        where: { node: { userId: userId } }
                    }]
                },
                selectionSet: selectionSet
            })

            return orgs[0];
        }
    }
}