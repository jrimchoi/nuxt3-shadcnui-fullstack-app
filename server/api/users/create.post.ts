import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { firstName, lastName, email, avatar, status, role } = body;

    // 필수 필드 검증
    if (!firstName || !lastName || !email) {
      throw createError({
        statusCode: 400,
        message: '필수 정보가 누락되었습니다.'
      });
    }

    // status 검증
    const validStatuses = ['Processing', 'Pending', 'Approved'];
    if (status && !validStatuses.includes(status)) {
      throw createError({
        statusCode: 400,
        message: '잘못된 상태값입니다.'
      });
    }

    // role 검증
    const validRoles = ['Admin', 'User'];
    if (role && !validRoles.includes(role)) {
      throw createError({
        statusCode: 400,
        message: '잘못된 역할입니다.'
      });
    }

    const filePath = path.join(process.cwd(), 'data', 'users.json');
    const dataDir = path.join(process.cwd(), 'data');

    // data 디렉토리가 없으면 생성
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // 기존 데이터 읽기 또는 새로운 배열 생성
    let users = [];
    if (fs.existsSync(filePath)) {
      users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // 새로운 사용자 생성
    const newUser = {
      id: nanoid(),
      firstName,
      lastName,
      email,
      avatar: avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${firstName}`,
      status: status || 'Pending',
      role: role || 'User',
      createdAt: new Date().toISOString(),
      actions: [
        { title: 'Detail', icon: 'heroicons:eye', path: `/users/${id}`, divider: false },
        { title: 'Edit', icon: 'heroicons:pencil-square', path: `/users/${id}/edit`, divider: false },
        { title: 'Delete', icon: 'heroicons:minus', path: `/users/${id}`, divider: false }
      ]
    };

    users.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return { success: true, user: newUser };
  } catch (error) {
    console.error('Error creating user:', error);
    throw createError({
      statusCode: 500,
      message: '사용자 생성 중 오류가 발생했습니다.'
    });
  }
}); 