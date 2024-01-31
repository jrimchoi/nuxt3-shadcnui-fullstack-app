import { userFaker } from '~/composables/userFaker';

export default defineEventHandler(async event => {
  // create fake user
  const user = { id: userFaker().id, email: userFaker().email };
  /**
   * In a reel app, you should reach out to your
   * DB/external auth service to fetch the user
   * and validate the different stuff
   */

  return await setUserSession(event, {
    user,
    authenticated: true,
    loggedInAt: new Date(),
    // any extra fields
  });
});
