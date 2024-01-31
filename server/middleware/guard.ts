import { useUsersStore } from '~/stores/users';

export default defineEventHandler(async event => {
  // get the url being called
  const url = getRequestURL(event);
  // get the pathname from the url
  const { pathname } = new URL(url);
  // create a list of endpoints that we want to protect
  // check if the pathname is in the list of protected routes
  console.log(useUsersStore().$state.protectedRoutes);
  
  for (let i = 0; i < useUsersStore().$state.protectedRoutes.length; i++) {
    const r = useUsersStore().$state.protectedRoutes[i];
    // if the pathname is in the list of protected routes
    if (pathname == r) {
      // ensure user is logged in before getting a response
      //await requireUserSession(event);
      return true;
    }
  }
});
