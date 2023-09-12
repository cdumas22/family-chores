import {
  type ActionFunction,
  type LoaderArgs,
  type V2_MetaFunction,
  json,
} from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { addDays, endOfDay, format, startOfDay } from "date-fns";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import {
  Badge,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Col,
  Container,
  Row,
  Stack,
} from "react-bootstrap";
import ChoreComplete from "~/components/ChoreComplete";
import PersonCard from "~/components/PersonCard";
import prisma from "~/lib/db.server";
import { useChoreContext } from "~/root";
import { DAY, IsDayChecked } from "~/utils/days";
import { requireUserId } from "~/utils/session.server";

export type personLoader = typeof loader;
export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const requestDate = new URLSearchParams(url.search).get("date");
  const d = startOfDay(
    requestDate ? new Date(Number(requestDate)) : new Date()
  );
  console.log("LOAD", requestDate, d);
  const groups = await prisma.group.findMany({
    where: { userId },
  });
  const group = groups.find((x) => x.id === params.groupId);
  if (!group) throw new Error("Group not found");

  const people = await prisma.person.findMany({
    where: { groupId: group.id },
    orderBy: [{ order: "asc" }],
  });
  const chores = await prisma.chore.findMany({
    where: {
      personId: { in: people.map((x) => x.id) },
      createdAt: {
        lte: endOfDay(d),
      },
      OR: [
        {
          deletedAt: {
            gt: d.valueOf().toString(),
          },
        },
        { deletedAt: null },
      ],
    },
  });

  const data = {
    people,
    chores,
    choreStatus: await prisma.chore_Status.findMany({
      where: {
        date: d.valueOf().toString(),
        choreId: { in: chores.map((x) => x.id) },
      },
    }),
  };

  const today = startOfDay(new Date());
  const next = addDays(d, 1);
  const previous = addDays(d, -1);
  return json({
    dates: {
      next: next > today ? null : next.valueOf().toString(),
      current: d.valueOf().toString(),
      today: next > today ? null : today.valueOf().toString(),
      previous: previous.valueOf().toString(),
    },
    groups,
    group,
    people: data.people.map((x) => ({
      ...x,
      chores: groupBy(
        orderBy(
          data.chores.flatMap((y) => {
            const status = data.choreStatus.find((z) => z.choreId === y.id);
            if (
              y.startDate != null &&
              y.endDate != null &&
              !(
                d.valueOf() >= Number(y.startDate) &&
                new Date() <= endOfDay(new Date(Number(y.endDate)))
              )
            )
              return [];

            return y.personId === x.id &&
              (y.repeat === 0 ||
                IsDayChecked(y.repeat, Object.values(DAY)[d.getDay()]))
              ? [{ ...y, status }]
              : [];
          }),
          ["timeOfDay", "order"]
        ),
        "timeOfDay"
      ),
    })),
  });
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export let action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  const url = new URL(request.url);
  const requestDate = new URLSearchParams(url.search).get("date");
  const d = startOfDay(
    requestDate ? new Date(Number(requestDate)) : new Date()
  );

  const data = new URLSearchParams(await request.text());
  const completeTodoId = data.get("complete");
  if (!completeTodoId)
    return json(
      { error: "Todo id must be defined" },
      {
        status: 400,
      }
    );
  const choreStatus = await prisma.chore_Status.findFirst({
    where: {
      choreId: completeTodoId,
      date: d.valueOf().toString(),
    },
  });

  // Create or update status
  if (choreStatus == null) {
    const chore = await prisma.chore.findUnique({
      where: { id: completeTodoId },
    });
    const created = await prisma.chore_Status.create({
      data: {
        date: d.valueOf().toString(),
        choreId: completeTodoId,
        pointValue: chore?.pointValue,
        completed: true,
      },
    });
    return json(created, { status: 201 });
  } else {
    const updatedTodo = await prisma.chore_Status.update({
      where: {
        id: choreStatus.id,
      },
      data: {
        completed: !choreStatus.completed,
      },
    });
    return json(updatedTodo, { status: 200 });
  }
};

export default function Index() {
  const { people, dates } = useLoaderData<personLoader>();
  let [searchParams, setSearchParams] = useSearchParams();
  const choreContext = useChoreContext();

  function setDay(date?: string | null) {
    if (date) {
      setSearchParams({ date });
    }
  }

  return (
    <Container
      fluid
      style={{
        height: "100vh",
        padding: "1rem",
        overflowY: "hidden",
        overflowX: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {choreContext.choreComplete && <ChoreComplete />}

      <Row style={{ flexWrap: "nowrap", height: "calc(100% - 32px)" }}>
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </Row>
      <Row
        className="mt-3"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          margin: "20px 0px 20px 32px",
        }}
      >
        <Col>
          <ButtonToolbar className="justify-content-between">
            <ButtonGroup size="sm">
              <Button
                variant="secondary"
                onClick={() => setDay(dates.previous)}
              >
                ◀︎ Previous Day
              </Button>
              <Button
                variant="primary"
                disabled={dates.today == null}
                onClick={() => setDay(dates.today)}
              >
                Today
              </Button>
              <Button
                variant="secondary"
                disabled={dates.next == null}
                onClick={() => setDay(dates.next)}
              >
                Next Day ▶︎
              </Button>
            </ButtonGroup>
            <Stack direction="horizontal" gap={4}>
              <h5 className="m-0">
                <Badge bg="secondary">
                  {format(new Date(Number(dates.current)), "PPPP")}
                </Badge>
              </h5>
            </Stack>
          </ButtonToolbar>
        </Col>
      </Row>
    </Container>
  );
}
