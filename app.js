const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@as-integrations/express5')
const express = require('express')
const { OGM } = require('@neo4j/graphql-ogm')

const { loadFilesSync } = require('@graphql-tools/load-files')
const { mergeTypeDefs } = require('@graphql-tools/merge')
const neo4j = require("neo4j-driver");

const typeDefs = loadFilesSync([
    "./graphql/**/*.graphql",
    "!./graphql/neo4j.directives.graphql"
])
const directiveTypes = loadFilesSync("./graphql/neo4j.directives.graphql")
const resolvers = loadFilesSync("./graphql/**/*.resolver.js")

const app = express()

async function startServer() {

    const driver = neo4j.driver(
        "neo4j://127.0.0.1:7687",
        neo4j.auth.basic("neo4j", "root-neo4j")
    )

    const driverInfo = await driver.verifyConnectivity()
    console.log(driverInfo)

    const ogm = await new OGM({
        typeDefs: mergeTypeDefs(typeDefs),
        driver: driver,
        database: "trajectory"
    });

    await ogm.init();

    const apolloServer = new ApolloServer({
        typeDefs: mergeTypeDefs([...typeDefs, ...directiveTypes]),
        resolvers: resolvers
    })

    await apolloServer.start();

    app.use(
        "/graphql",
        express.json(),
        expressMiddleware(apolloServer, {
            context: ({req, res}) => ({ ogm: ogm })
        })
    );

    app.listen(9090, () => {
        console.log('Express server started @9090');
    });
}

startServer().then(r => {}).catch(err => { console.log("Error: "+ err) });