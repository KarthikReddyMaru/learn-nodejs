const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@as-integrations/express5')
const express = require('express')

const app = express()

const { loadFilesSync } = require('@graphql-tools/load-files')
const { mergeTypeDefs } = require('@graphql-tools/merge')

const typeDefs = loadFilesSync("./graphql/**/*.graphql")
const resolvers = loadFilesSync("./graphql/**/*.resolver.js")

const apolloServer = new ApolloServer({
    typeDefs: mergeTypeDefs(typeDefs),
    resolvers: resolvers
})

async function startServer() {

    await apolloServer.start();

    app.use(
        "/graphql",
        express.json(),
        expressMiddleware(apolloServer)
    );

    app.listen(9090, () => {
        console.log('Express server started @9090');
    });
}

startServer().then(r => {}).catch(err => { console.log("Error: "+ err) });