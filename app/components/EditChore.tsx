import { Prisma } from "@prisma/client";
import { useState } from "react";
import { Form } from "react-bootstrap";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { DAY, EVERY_DAY, IsDayChecked } from "~/utils/days";

type Chore = Prisma.ChoreGetPayload<{}>;
type Person = Prisma.PersonGetPayload<{}>;
export default ({ chore, people }: { chore?: Chore; people: Person[] }) => {
  const [repeat, setRepeat] = useState(chore?.repeat ?? 0);

  return (
    <>
      <FloatingLabel controlId="chore.task" label="Task" className="mb-3">
        <Form.Control required name="task" defaultValue={chore?.task} />
      </FloatingLabel>
      <FloatingLabel
        controlId="chore.icon"
        label="Icon"
        className="mb-3"
        placeholder="use an emoji icon"
      >
        <Form.Control name="icon" defaultValue={chore?.icon} />
      </FloatingLabel>
      <Form.Group className="mb-3" controlId="chore.timeOfDay">
        <Form.Label>Time of day</Form.Label>
        <Form.Select
          required
          name="timeOfDay"
          defaultValue={chore?.timeOfDay ?? "morning"}
        >
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </Form.Select>
      </Form.Group>
      <Form.Group>
        <Form.Label>Days</Form.Label>
        <input type="hidden" name="repeat" value={repeat} />
        <Form.Check
          label="Every Day"
          value={EVERY_DAY}
          checked={repeat === EVERY_DAY}
          id="checkbox-everyday"
          onChange={(e) => setRepeat(e.target.checked ? EVERY_DAY : 0)}
        />
        {Object.entries(DAY).map(([day, value]) => (
          <Form.Check
            label={day}
            value={day}
            checked={IsDayChecked(repeat, value)}
            id={`checkbox-${day}`}
            onChange={(e) =>
              setRepeat(e.target.checked ? repeat | value : repeat & ~value)
            }
          />
        ))}
      </Form.Group>
      <Form.Group className="mb-3" controlId="chore.person">
        <Form.Label>Person</Form.Label>
        <Form.Select
          required
          name="personId"
          defaultValue={chore?.personId ?? ""}
        >
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </>
  );
};
