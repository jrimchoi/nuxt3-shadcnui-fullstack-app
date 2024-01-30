import { userFaker } from '~/utils/userFaker';

export default defineEventHandler(async event => {
  // create fake user
  const user = userFaker();
  /**
   * In a reel app, you should reach out to your
   * DB/external auth service to fetch the user
   * and validate the different stuff
   */
  await setUserSession(event, {
    user,
    loggedInAt: new Date(),
    // any extra fields
  });
  return user;
});
