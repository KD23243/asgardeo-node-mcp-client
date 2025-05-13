import { AsgardeoClient } from "./AsgardeoClient.js";

const client = new AsgardeoClient({
  name: 'streamable-http-client-example',
  version: '1.0.0',
  serverBaseUrl: process.env.SERVER_BASE_URL,
  clientId: process.env.CLIENT_ID!,
  authorizationEndpoint: process.env.AUTHORIZATION_ENDPOINT!,
  tokenEndpoint: process.env.TOKEN_ENDPOINT!,
  redirectUri: process.env.REDIRECT_URI!,
  scope: process.env.SCOPE!,
});

const main = async () => {
  try {
    const tools = await client.secureListTools();
    console.log('Tools:', tools);

    const getInfo = await client.secureCallTool({
      name: "get_pet_vaccination_info",
      arguments: {
        petId: "123"
      }
    });
    console.log("Result:", getInfo);

    const bookAppointment = await client.secureCallTool({
      name: "book_vet_appointment",
      arguments: {
        petId: "123",
        date: "2025-05-13",
        time: "11:06 AM",
        reason: "Routine checkup"
      }
    });
    console.log("Result:", bookAppointment);

  } catch (err) {
    console.error("Unhandled error:", err);
  }
};

main();