import { faker } from '@faker-js/faker';
import { type User } from '../stores/users';

export function userFaker(): User {
  const items = ['pending', 'processing', 'success', 'failed'];
  const domains = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'];
  const roles = ['Admin', 'CEO', 'Manger'];
  let users: User[] = [];

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const user = {
    id: faker.string.nanoid(5),
    firstName: firstName,
    lastName: lastName,
    email: firstName + '.' + lastName + domains[Math.floor(Math.random() * items.length)],
    avatar: faker.internet.avatar(),
    status: items[Math.floor(Math.random() * items.length)],
    price: faker.commerce.price(),
    role: ['User', roles[Math.floor(Math.random() * items.length)]],
    createdAt: faker.defaultRefDate(),
    actions: [
      { title: 'Detail', icon: 'heroicons:eye', path: '/users/{$id}', divider: false },
      { title: 'Edit', icon: 'heroicons:pencil-square', path: '/users/${id}/edit', divider: false },
      { title: 'Delete', icon: 'heroicons:minus', path: '/users/${id}', divider: false },
      { title: 'List', icon: 'heroicons:list-bullet', path: '/users/${id}/list', divider: false },
      { title: '', icon: '', path: '', divider: true },
      { title: 'Pinter', icon: 'heroicons:printer', path: '/users/${id}/printer', divider: false },
    ],
  };
  return user;
}
