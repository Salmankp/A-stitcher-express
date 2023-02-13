require('dotenv').config();
const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const apiRoutes = ['./routes/api'];

const options = {
    info: {
        title: "Sticher",
        description: "Sticher API's Documentation"
    },
    schemes: process.env.ENVIRONMENT === "local" ? ['http'] : ['https'],
    basePath: "/api/v1/",
    host: process.env.DEPLOY_URL,
    securityDefinitions: {
        Bearer: {
          type: "apiKey",
          in: "header", 
          name: "Authorization",
          description:
              "Please enter a valid JWT token to test the requests below...",
      },
  },
  security: [{ Bearer: [] }]
}

const generateAutoSwagger = () => {
     swaggerAutogen(outputFile, apiRoutes, options).then(() => {
        console.log('swagger doc updated');
    });
} 

module.exports = {
    generateAutoSwagger
  };