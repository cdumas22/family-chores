import { ActionFunction, V2_MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Container, Row } from "react-bootstrap";
import ChoreComplete from "~/components/ChoreComplete";
import PersonCard from "~/components/PersonCard";
import AddChore from "~/components/chores/add-chore";
import prisma from "~/lib/db.server";
import { useChoreContext } from "~/root";

export const loader = async () => {
  const data = {
    people: await prisma.person.findMany({include: { chores: true}}),
  }
  return json(data)
}

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export let action: ActionFunction = async ({ request }) => {
  if (request.method === 'PUT') {
    const data = new URLSearchParams(await request.text())
    const completeTodoId = data.get('complete')
    if (!completeTodoId)
      return json(
        { error: 'Todo id must be defined' },
        {
          status: 400,
        }
      )
    const todo = await prisma.chore.findUnique({
      where: {
        id: completeTodoId,
      },
    })
    if (!todo) {
      return json(
        { error: 'Todo does not exist' },
        {
          status: 400,
        }
      )
    }
    const updatedTodo = await prisma.chore.update({
      where: {
        id: todo.id,
      },
      data: {
        completed: !todo.completed,
      },
    })
    return json({ todo: updatedTodo }, { status: 200 })
  }
  return null
}

export default function Index() {
  const { people } = useLoaderData<typeof loader>()
  const choreContext = useChoreContext()

  return (
    <Container fluid style={{ height: '100vh' }}>
      {choreContext.choreComplete && <ChoreComplete />}
      <Row  style={{flexWrap: 'nowrap'}}>
        {people.map((person) => (
          <PersonCard key={person.id} person={person as any}/>
        ))}
      </Row>
    </Container>
  );
}
