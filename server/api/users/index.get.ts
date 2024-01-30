import { User } from '~/stores/users'; 
import { userFaker } from '~/utils/UserFaker';

export default defineEventHandler(event => {
  const q = getQuery(event);
  const count = Number(q.count || 100);
  let users: User[] = [];

  for (let i = 0; i < count; i++) {
    const user = userFaker();
    users.push(user);
  }
  return users;
});
