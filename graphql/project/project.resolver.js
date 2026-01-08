const { print } = require('graphql/language')
module.exports = {

    Query: {

        /**
         *
         * @param parent
         * @param context { import('@apollo/server').GraphQLFieldResolver<any, GraphQLContext> }
         * @param context.ogm { import('@neo4j/graphql-ogm').OGM }
         * @param name
         * @param info
         */
        project: async (parent, { projectId }, context, info) => {
            const Project = context.ogm.model("Project")
            const [ projects ] = await Project.find({
                where: {
                    projectId: projectId,
                    members_SOME: {
                        userId: context.jwt.sub
                    }
                },
                selectionSet: print(info.fieldNodes[0].selectionSet),
                context: context
            })

            console.log(projects)

            return projects;
        }
    },

    Mutation: {

        /**
         *
         * @param parent
         * @param name
         * @param orgId
         * @param ogm { import('@neo4j/graphql-ogm').OGM }
         * @param info
         */
        createProject: async (parent, { name, orgId }, { ogm }, info) => {

            const Project = ogm.model("Project");
            const clientSelection = print(info.fieldNodes[0].selectionSet)
            const selectionSet = `{ projects ${clientSelection} }`

            const { projects } = await Project.create({
                input: [{
                    name: name,
                    org: {
                        connect: {
                            where: {
                                node: {
                                    orgId: orgId
                                }
                            }
                        }
                    }
                }],
                selectionSet: selectionSet
            })

            console.log(projects)

            return projects[0];
        },

        addToProject: async (parent, { userId, projectId }, context, info) => {

            const Project = context.ogm.model("Project");
            const clientSelection = print(info.fieldNodes[0].selectionSet);
            const selectionSet = `{ projects ${clientSelection} }`

            const { projects } = await Project.update({
                where: {
                    projectId: projectId
                },
                connect: {
                    members: {
                        where: {
                            node: {
                                userId: userId
                            }
                        }
                    }
                },
                selectionSet: selectionSet
            })

            return projects[0];
        },

        removeFromProject: async (parent, { userId, projectId }, context, info) => {

            const Project = context.ogm.model("Project");
            const clientSelection = print(info.fieldNodes[0].selectionSet);
            const selectionSet = `{ projects ${clientSelection} }`

            const { projects } = await Project.update({
                where: {
                    projectId: projectId
                },
                disconnect: {
                    members: {
                        where: {
                            node: {
                                userId: userId
                            }
                        }
                    }
                },
                selectionSet: selectionSet
            })

            return projects[0];
        },

        // deleteProject: async (parent, { projectId }, context, info) => {
        //
        //     const Project = context.ogm.model("Project");
        //     await Project.delete({
        //         where: { projectId: projectId }
        //     })
        //
        //     return true;
        // },
    }
}