const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// 미들웨어(Middleware) : 요청이 라우트에 도달하기 전에 먼저 거쳐가는 중간 처리 단계를 의미한다. express.json()이 대표적인 미들웨어이다.

app.use(express.static('public'));
// public 폴더 안의 정적 파일(html, css, js, 이미지 등)을 그대로 웹에서 접근할 수 있게 해준다.

app.use(express.json());
// 요청으로 들어오는 JSON 데이터를 해석해서 req.body에 저장한다.
// req.body : 요청과 함께 전달된 데이터가 담기는 저장 공간을 의미한다.
// 해당 코드를 통해 이후 사용할 POST/PUT 라우트에서 데이터를 받아서 빈 값으로 처리되지 않도록 처리한다.

app.get('/todos', async (req, res) => {
  const todos = await prisma.todo.findMany();
  res.json(todos);
});

app.post('/todos', async (req, res) => {
  const newTodo = await prisma.todo.create({
    data: {
      title: req.body.title,
    },
  });
  res.json(newTodo);
});

app.put('/todos/:id', async (req, res) => {
  const updatedTodo = await prisma.todo.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(updatedTodo);
});

app.delete('/todos/:id', async (req, res) => {
  const deletedTodo = await prisma.todo.delete({
    where: { id: Number(req.params.id) },
  });
  res.json(deletedTodo);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
