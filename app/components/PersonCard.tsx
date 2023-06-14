import { Chore, Prisma } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button, Card, Col, Dropdown, ListGroup } from "react-bootstrap";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { MdCheckCircleOutline } from "react-icons/md";
import { MdCheckCircle } from "react-icons/md";
import { useChoreContext } from "~/root";
import type { personLoader } from "~/routes/_index";

type Person = SerializeFrom<personLoader>[number];

function ChoreLabel({ chore }: { chore: Person["chores"][number] }) {
  return (
    <div className="d-flex align-items-center" style={{ gap: "10px" }}>
      {chore.icon ? (
        <div className="fs-2">{chore.icon}</div>
      ) : chore.status?.completed ? (
        <MdCheckCircle className="fs-1" />
      ) : (
        <MdCheckCircleOutline className="fs-1" />
      )}{" "}
      <span
        className={`pl-1 fs-3 ${
          chore.status?.completed ? "text-decoration-line-through" : ""
        }`}
      >
        {chore.task}
      </span>
    </div>
  );
}

function EditBtn({ chore }: { chore: Person["chores"][number] }) {
  return (
    <Button
      variant="secondary"
      href={`/chore/${chore.id}`}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        margin: "0.25rem",
        background: "white",
        border: "none",
      }}
      size="sm"
    >
      ✏️
    </Button>
  );
}

export default function ({
  person,
  onDeleteChore: deleteChore,
}: {
  person: Person;
  onDeleteChore: (choreId: string) => void;
}) {
  const todo = person.chores.filter((x) => !x.status?.completed);
  const done = person.chores.filter((x) => !!x.status?.completed);
  const percentage = (done.length / person.chores.length) * 100;
  const progressStyles = { width: "115px", margin: "auto" };
  const choreContext = useChoreContext();
  const listStyles = {
    borderLeftWidth: "5px",
    borderLeftColor: person.color,
  };
  const buttonStyles = {
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left",
  };
  function onDone() {
    choreContext.choreComplete = true;
    choreContext.choreColor = person.color;
  }

  return (
    <Col style={{ flexBasis: "320px" }}>
      <Card bg="light" className="d-flex flex-column h-100 pb-3">
        <Card.Body style={{ flex: "0 1 auto" }}>
          <Card.Title>
            <Button
              variant="secondayr"
              href={`/person/${person.id}`}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                margin: "0.25rem",
              }}
            >
              ✏️
            </Button>
            <div style={progressStyles}>
              <CircularProgressbar
                value={percentage}
                text={person.name}
                styles={buildStyles({
                  strokeLinecap: "round",
                  pathColor: person.color,
                  textColor: person.color,
                })}
              />
            </div>

            <div className="fw-lighter" style={{ textAlign: "center" }}>
              {done.length} of {person.chores.length} Complete
            </div>
          </Card.Title>
        </Card.Body>
        <div style={{ overflow: "auto" }} className="p-3 pt-0">
          TO-DO
          {todo.length ? (
            <ListGroup>
              {todo.map((chore) => (
                <ListGroup.Item
                  key={chore.id}
                  style={listStyles}
                  className="d-flex justify-content-between"
                >
                  <Form method="put">
                    <input hidden name="complete" defaultValue={chore.id} />
                    <button
                      style={buttonStyles as any}
                      type="submit"
                      onClick={onDone}
                    >
                      <ChoreLabel chore={chore} />
                    </button>
                  </Form>
                  <EditBtn chore={chore} />
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="fs-3 text-center">🎉 All Done 🎉 </div>
          )}
          COMPLETED
          {done.length ? (
            <ListGroup>
              {done.map((chore) => (
                <ListGroup.Item
                  key={chore.id}
                  style={listStyles}
                  className="d-flex justify-content-between bg-light"
                >
                  <Form method="put">
                    <input hidden name="complete" defaultValue={chore.id} />
                    <button
                      style={buttonStyles as any}
                      type="submit"
                      className="text-muted"
                    >
                      <ChoreLabel chore={chore} />
                    </button>
                  </Form>
                  <EditBtn chore={chore} />
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div>Get working!</div>
          )}
        </div>
      </Card>
    </Col>
  );
}
