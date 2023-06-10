import { Prisma } from "@prisma/client";
import { Form } from "@remix-run/react";
import { Card, Col, ListGroup } from "react-bootstrap";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { MdCheckCircleOutline } from "react-icons/md";
import { MdCheckCircle } from "react-icons/md";
import { useChoreContext } from "~/root";

type PersonWithChores = Prisma.PersonGetPayload<{
  include: {
    chores: true;
  };
}>;

export default function ({ person }: { person: PersonWithChores }) {
  const todo = person.chores.filter((x) => !x.completed);
  const done = person.chores.filter((x: any) => !!x.completed);
  const percentage = (done.length / person.chores.length) * 100;
  const progressStyles = { width: "115px", margin: "auto" };
  const choreContext = useChoreContext()
  const listStyles = {
    borderLeftWidth: "5px",
    borderLeftColor: person.color,
  };
  const buttonStyles = {
    border: "none",
    background: "none",
    width: "100%",
    textAlign: 'left'
  }
  function onDone() {
    choreContext.choreComplete = true;
    choreContext.choreColor = person.color;
  }
  return (
    <Col style={{flexBasis: "320px"}}>
      <Card bg="light" >
        <Card.Body>
          <Card.Title>
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

          <div>
            TO-DO
            {todo.length ? (
              <ListGroup>
                {todo.map((chore) => (
                  <Form method="put" key={chore.id}>
                    <input hidden name="complete" defaultValue={chore.id} />
                    <button
                      style={buttonStyles as any}
                      type="submit"
                      onClick={onDone}
                    >
                      <ListGroup.Item style={listStyles}>
                        <MdCheckCircleOutline className="fs-1 opacity-50" />{" "}
                        {chore.task}
                      </ListGroup.Item>
                    </button>
                  </Form>
                ))}
              </ListGroup>
            ) : (
              <div className="fs-3 text-center">🎉 All Done 🎉 </div>
            )}
            COMPLETED
            {done.length ? (
              <ListGroup>
                {done.map((chore) => (
                  <Form method="put" key={chore.id}>
                    <input hidden name="complete" defaultValue={chore.id} />
                    <button
                      style={buttonStyles as any}
                      type="submit"
                    >
                      <ListGroup.Item style={listStyles}>
                        <MdCheckCircle className="fs-1" /> {chore.task}
                      </ListGroup.Item>
                    </button>
                  </Form>
                ))}
              </ListGroup>
            ) : (
              <div>Get working!</div>
            )}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}
